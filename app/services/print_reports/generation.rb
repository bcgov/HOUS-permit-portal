module PrintReports
  class Generation
    def initialize
      @data = Data.for_generation
      @renderer = Renderer.new
    end

    def submission(version)
      application = version.permit_application
      namer =
        PermitApplicationGeneratedFileNamer.new(
          application,
          date: version.created_at
        )
      [
        [
          SupportingDocument::APPLICATION_PDF_DATA_KEY,
          :application,
          namer.permit_application_pdf(version_number: version.version_number)
        ],
        [
          SupportingDocument::CHECKLIST_PDF_DATA_KEY,
          :application_step_code,
          namer.step_code_checklist_pdf(version_number: version.version_number)
        ]
      ].each do |key, method, filename|
        if method == :application_step_code && !version.has_step_code_checklist?
          next
        end
        existing = version.supporting_documents.find_by(data_key: key)
        if existing&.file.present?
          promote!(existing)
          next
        end
        report = @data.public_send(method, application, version.id)
        @renderer.render(report, filename: filename) do |path|
          version.with_lock do
            doc =
              version.supporting_documents.find_or_initialize_by(
                data_key: key,
                permit_application_id: application.id
              )
            if doc.file.blank?
              File.open(path, "rb") { |file| doc.update!(file: file) }
            end
            promote!(doc)
          end
        end
      end
    end

    def step_code(step_code, checklist, filename:)
      report = @data.step_code(step_code, checklist.id)
      digest = source_digest(report)
      @renderer.render(report, filename: filename) do |path|
        doc = nil
        checklist.with_lock do
          current = @data.step_code(step_code.reload, checklist.id)
          unless source_digest(current) == digest
            raise Renderer::Error,
                  "Checklist changed during PDF generation; retry required"
          end
          doc =
            checklist.reload.report_document ||
              checklist.build_report_document(step_code: step_code)
          File.open(path, "rb") { |file| doc.file = file }
          doc.stale = false
          doc.save!
          promote!(doc)
        end
        # Child rows can be edited independently of the checklist lock. Recheck
        # after publication so edits during the transaction cannot be labelled fresh.
        if source_digest(@data.step_code(step_code.reload, checklist.id)) !=
             digest
          doc.update!(stale: true)
          raise Renderer::Error,
                "Checklist changed during PDF publication; retry required"
        end
        NotificationService.publish_step_code_report_generated_event(doc)
      end
    end

    def promote!(doc)
      if doc.file_data["storage"] == "cache"
        PromoteJob.new.perform(
          doc.file_attacher.class.name,
          doc.class.name,
          doc.id,
          "file",
          doc.file_data
        )
      end
      doc.reload
      unless doc.file_available? && doc.file_data["storage"] == "store" &&
               doc.file.exists?
        raise Renderer::Error,
              "Generated document is not available in permanent storage"
      end
    end

    private

    def source_digest(report)
      stable = report.deep_dup
      stable[:identity].delete(:exported_at)
      stable[:checklist]&.delete("report_document")
      Digest::SHA256.hexdigest(JSON.generate(stable))
    end
  end
end

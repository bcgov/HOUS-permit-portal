module PrintReports
  class Generation
    def initialize
      @data = Data.for_generation
      @renderer = Renderer.new
    end

    def submission(version, recover: false)
      ApplicationLock.synchronize(version.permit_application_id) do
        generate_submission(version.reload, recover: recover)
      end
    end

    def generate_submission(version, recover:)
      application = version.permit_application
      results = []
      [
        [
          SupportingDocument::APPLICATION_PDF_DATA_KEY,
          :application,
          "application"
        ],
        [
          SupportingDocument::CHECKLIST_PDF_DATA_KEY,
          :application_step_code,
          "checklist"
        ]
      ].each do |key, method, kind|
        next if kind == "checklist" && !version.has_step_code_checklist?
        begin
          existing = version.supporting_documents.find_by(data_key: key)
          if existing&.file.present? &&
               (!recover || StoredFile.valid_pdf?(existing.file))
            promote!(existing)
            results << { kind: kind, status: "reused" }
            next
          end
          report = @data.public_send(method, application, version.id)
          filename = Snapshot.filename(version, kind)
          @renderer.render(report, filename: filename) do |path|
            version.with_lock do
              doc =
                version.supporting_documents.find_or_initialize_by(
                  data_key: key,
                  permit_application_id: application.id
                )
              replace =
                doc.file.blank? || (recover && !StoredFile.valid_pdf?(doc.file))
              if replace
                # Upload and validate permanent storage before replacing the row.
                # A unique storage key prevents delayed old-file cleanup removing
                # the replacement. Failed publication leaves the old row intact.
                uploaded =
                  File.open(path, "rb") do |file|
                    FileUploader.new(:store).upload(
                      file,
                      metadata: {
                        "filename" => filename
                      }
                    )
                  end
                unless StoredFile.valid_pdf?(uploaded)
                  raise Renderer::Error, "Replacement PDF is unavailable"
                end
                doc.file = uploaded
                doc.save!
              end
              promote!(doc)
              results << { kind: kind, status: replace ? "restored" : "reused" }
            end
          end
        rescue Data::Unavailable => e
          results << { kind: kind, status: "blocked", reason: e.message }
        end
      end
      results
    end
    private :generate_submission

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

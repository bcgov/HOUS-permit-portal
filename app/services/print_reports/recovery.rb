module PrintReports
  class Recovery
    def self.call(version)
      ApplicationLock.synchronize(version.permit_application_id) do
        application = version.permit_application
        versions = application.submission_versions.order(:created_at, :id).to_a
        index = versions.index { |entry| entry.id == version.id }
        results = Generation.new.submission(version, recover: true)
        replaced = results.any? { |result| result[:status] == "restored" }
        cumulative = versions.take(index)
        versions
          .drop(index)
          .each do |target|
            cumulative << target
            needs_zip = (replaced || !StoredFile.valid_zip?(target.zipfile))
            next unless needs_zip
            blockers =
              cumulative.flat_map do |entry|
                expected = [SupportingDocument::APPLICATION_PDF_DATA_KEY]
                if entry.has_step_code_checklist?
                  expected << SupportingDocument::CHECKLIST_PDF_DATA_KEY
                end
                expected.filter_map do |key|
                  doc = entry.supporting_documents.find_by(data_key: key)
                  unless doc && StoredFile.valid_pdf?(doc.file)
                    "#{entry.id}:#{key}"
                  end
                end
              end
            if blockers.any?
              results << {
                kind: "zip",
                submission_version_id: target.id,
                status: "blocked",
                reason: "Required PDFs unavailable: #{blockers.join(", ")}"
              }
              next
            end
            begin
              SupportingDocumentsZipper.new(
                application.id,
                submission_version: target,
                version_ids: cumulative.map(&:id)
              ).perform
              results << {
                kind: "zip",
                submission_version_id: target.id,
                status: "restored"
              }
            rescue SupportingDocumentsZipper::Unavailable => e
              results << {
                kind: "zip",
                submission_version_id: target.id,
                status: "blocked",
                reason: e.message
              }
            end
          end
        # Preserve the original readiness event: recovery never sends a second
        # package-ready webhook. Normal generation handles first publication.
        WebsocketBroadcaster.push_update_to_relevant_users(
          application.notifiable_users.pluck(:id),
          Constants::Websockets::Events::PermitApplication::DOMAIN,
          Constants::Websockets::Events::PermitApplication::TYPES[
            :update_supporting_documents
          ],
          PermitApplicationBlueprint.render_as_hash(
            application.reload,
            view: :supporting_docs_update
          )
        )
        results
      end
    end
  end
end

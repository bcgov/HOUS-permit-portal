module PrintReports
  class Recovery
    def self.call(version)
      application = version.permit_application
      # Render before the lock. Generation takes the lock only to publish.
      results = Generation.new.submission(version, recover: true)
      versions = application.submission_versions.order(:created_at, :id).to_a
      index = versions.index { |entry| entry.id == version.id }
      cumulative = versions.take(index)
      versions
        .drop(index)
        .each do |target|
          cumulative << target
          # Always rebuild on manual recovery: a previous attempt may have
          # repaired the PDF but failed before publishing all affected ZIPs.
          # Lock only the ZIP write. An unrecoverable historical PDF is omitted
          # and does not block this package; a PDF we can still render does.
          ApplicationLock.synchronize(application.id) do
            prefix = cumulative.map(&:reload)
            current = prefix.last
            regenerable =
              prefix.select do |entry|
                entry.missing_pdfs? && !entry.unrecoverable_report?
              end
            if current.unrecoverable_report?
              missing =
                current.report_generation_issues.map { |issue| issue[:key] }
              results << blocked_zip(current, missing.join(", "))
            elsif regenerable.any?
              results << blocked_zip(current, regenerable.map(&:id).join(", "))
            else
              begin
                SupportingDocumentsZipper.new(
                  application.id,
                  submission_version: current,
                  version_ids: prefix.map(&:id)
                ).perform
                results << {
                  kind: "zip",
                  submission_version_id: current.id,
                  status: "restored"
                }
              rescue SupportingDocumentsZipper::Unavailable => e
                results << {
                  kind: "zip",
                  submission_version_id: current.id,
                  status: "blocked",
                  reason: e.message
                }
              end
            end
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

    def self.blocked_zip(version, detail)
      {
        kind: "zip",
        submission_version_id: version.id,
        status: "blocked",
        reason: "Required PDFs unavailable: #{detail}"
      }
    end
    private_class_method :blocked_zip
  end
end

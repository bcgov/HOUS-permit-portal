class ZipfileJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    ## only lock on the first argument, which is the permit application id
    ## this will prevent multiple jobs from running for the same permit application
    [args[0]]
  end

  def perform(permit_application_id)
    @permit_application_id = permit_application_id
    permit_application = PermitApplication.find_by_id(permit_application_id)
    return if permit_application.blank?

    version_ids_at_start = permit_application.submission_versions.pluck(:id)
    # PDF rendering happens in build_packages and must not run under the
    # application lock. The lock below covers readiness only.
    build_packages(permit_application, version_ids_at_start)

    PrintReports::ApplicationLock.synchronize(permit_application.id) do
      permit_application.reload
      newly_ready = permit_application.mark_submission_packages_ready!
      newly_ready.each do |submission_version|
        permit_application.enqueue_package_ready_webhooks(submission_version)
      end

      WebsocketBroadcaster.push_update_to_relevant_users(
        permit_application.notifiable_users.pluck(:id),
        Constants::Websockets::Events::PermitApplication::DOMAIN,
        Constants::Websockets::Events::PermitApplication::TYPES[
          :update_supporting_documents
        ],
        PermitApplicationBlueprint.render_as_hash(
          permit_application.reload,
          { view: :supporting_docs_update }
        )
      )

      # ponytail: until_executed lock is still held inside perform, so a sibling
      # submit's enqueue is rejected. after_unlock re-runs if a version appeared
      # mid-job. Upgrade: per-version lock or a dedicated follow-up job.
      @reenqueue =
        (
          permit_application.submission_versions.pluck(:id) -
            version_ids_at_start
        ).any?
    end
  end

  def build_packages(application, version_ids)
    versions =
      application
        .submission_versions
        .where(id: version_ids)
        .order(:created_at, :id)
        .to_a
    rebuild_ids =
      versions
        .select do |v|
          v.missing_pdfs? || v.zipfile_data.blank? || v.package_ready_at.blank?
        end
        .map(&:id)
    first_missing = versions.index(&:missing_pdfs?)
    rebuild_ids |= versions.drop(first_missing).map(&:id) if first_missing
    PdfGenerationJob.new.perform(application.id, version_ids)
    versions.each(&:reload)
    cumulative_ids = []
    versions.each do |version|
      cumulative_ids << version.id
      next unless rebuild_ids.include?(version.id)
      current = version.reload
      prefix = versions.take(cumulative_ids.length)
      # This version's snapshot cannot produce the missing PDF. Skip its ZIP.
      # Later versions still publish; the download dialog lists this gap via
      # report_generation_issues instead of withholding every newer package.
      next if current.unrecoverable_report?
      # A prefix file we can still render must be in the archive. Raising
      # retries the job. An unrecoverable earlier file is not this case.
      if prefix.any? { |entry|
           entry.missing_pdfs? && !entry.unrecoverable_report?
         }
        raise "Required PDFs are missing"
      end
      PrintReports::ApplicationLock.synchronize(application.id) do
        SupportingDocumentsZipper.new(
          application.id,
          submission_version: current,
          version_ids: cumulative_ids.dup
        ).perform
      end
    end
  end

  def after_unlock
    return unless @reenqueue && @permit_application_id.present?

    self.class.perform_async(@permit_application_id)
  end
end

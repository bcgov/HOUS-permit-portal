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

    PdfGenerationJob.new.perform(permit_application_id)
    SupportingDocumentsZipper.new(permit_application_id).perform

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
        permit_application.submission_versions.pluck(:id) - version_ids_at_start
      ).any?
  end

  def after_unlock
    return unless @reenqueue && @permit_application_id.present?

    self.class.perform_async(@permit_application_id)
  end
end

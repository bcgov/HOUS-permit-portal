class ZipfileJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_and_while_executing,
                  queue: :file_processing,
                  on_conflict: {
                    client: :log,
                    server: :reject
                  }

  def self.lock_args(args)
    ## only lock on the first argument, which is the permit application id
    ## this will prevent multiple jobs from running for the same permit application
    [args[0]]
  end

  def perform(permit_application_id)
    PdfGenerationJob.new.perform(permit_application_id)
    SupportingDocumentsZipper.new(permit_application_id).perform

    permit_application = PermitApplication.find_by_id(permit_application_id)

    if permit_application.present?
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
    end
  end
end

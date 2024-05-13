class AutomatedCompliance::DigitalSealValidatorJob
  include Sidekiq::Worker
  sidekiq_options queue: :websocket, lock: :until_and_while_executing

  def perform(permit_application_id)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?
    AutomatedCompliance::DigitalSealValidator.new.call(permit_application)

    permit_application.assign_attributes(front_end_form_update: permit_application.formatted_compliance_data)

    WebsocketBroadcaster.push_update_to_relevant_users(
      permit_application.collaborators.pluck(:id),
      Constants::SocketTypes::Domain::PERMIT_APPLICATION,
      Constants::SocketTypes::Event::UPDATE,
      PermitApplicationBlueprint.render_as_hash(permit_application, { view: :compliance_update }),
    )
  end
end

class AutomatedCompliance::DigitalSealValidatorJob
  include Sidekiq::Worker
  sidekiq_options queue: :websocket, lock: :until_and_while_executing

  def perform(permit_application_id)
    @permit_application_id = permit_application_id
    @completed = false
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?
    AutomatedCompliance::DigitalSealValidator.new.call(permit_application)

    # Broadcast current answers, including files added during validation.
    permit_application.reload

    permit_application.assign_attributes(
      front_end_form_update: permit_application.formatted_compliance_data
    )

    WebsocketBroadcaster.push_update_to_relevant_users(
      permit_application.notifiable_users.pluck(:id),
      Constants::Websockets::Events::PermitApplication::DOMAIN,
      Constants::Websockets::Events::PermitApplication::TYPES[
        :update_compliance
      ],
      PermitApplicationBlueprint.render_as_hash(
        permit_application,
        { view: :compliance_update }
      )
    )
    @completed = true
  end

  def after_unlock
    return unless @completed && @permit_application_id
    @completed = false
    # Recheck after unlocking, including saves made while broadcasting results.
    application = PermitApplication.find_by(id: @permit_application_id)
    unless application &&
             DigitalSealChecks.new(application).pending_documents.any?
      return
    end
    self.class.perform_async(@permit_application_id)
  end
end

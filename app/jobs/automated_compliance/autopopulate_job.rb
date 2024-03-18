class AutomatedCompliance::AutopopulateJob < ApplicationJob
  queue_as :default

  def perform(permit_application)
    unfilled = permit_application.automated_compliance_unique_unfilled_modules

    if unfilled.length > 0
      unfilled.each { |cm_name| match(cm_name, permit_application) }
      #In the future start a sidekiq batch to kick these things off

      #set front end form updates, force these to get picked up for processing
      #these are for forms already loaded and rendered
      permit_application.assign_attributes(front_end_form_update: permit_application.formatted_compliance_data)

      WebsocketBroadcaster.push_update_to_relevant_users(
        permit_application.collaborators,
        "permit_application",
        "update",
        PermitApplicationBlueprint.render_as_hash(permit_application, { view: :compliance_update }),
      )
    end
  end

  def match(compliance_module_name, permit_application)
    unless (%w[DigitalSealValidator ParcelInfoExtractor HistoricSite]).include? compliance_module_name
      #AlrValidator
      Rails.logger.error "unsafe compliance module called #{compliance_module_name}"
      return
    end
    #looks for a matching job, if not, runs the module directly
    if Object.const_defined?("AutomatedCompliance::#{compliance_module_name}Job")
      "AutomatedCompliance::#{compliance_module_name}Job".safe_constantize.perform_later(permit_application)
    else
      "AutomatedCompliance::#{compliance_module_name}".safe_constantize.new.call(permit_application)
    end
  end
end

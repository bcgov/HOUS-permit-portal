class AutomatedCompliance::AutopopulateJob < ApplicationJob
  queue_as :default

  def perform(permit_application)
    permit_application.automated_compliance_unique_unfilled_modules.each do |cm_name|
      match(cm_name, permit_application)
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

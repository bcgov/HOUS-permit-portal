class StepCode < ApplicationRecord
  belongs_to :permit_application, optional: true

  delegate :number, to: :permit_application, prefix: :building_permit
  delegate :submitter,
           :nickname,
           :jurisdiction_name,
           :full_address,
           :pid,
           :newly_submitted_at,
           :status,
           :jurisdiction_heating_degree_days,
           to: :permit_application,
           allow_nil: true

  def builder
    "" #replace with a config on permit application
  end

  def primary_checklist
    raise NotImplementedError,
          "Subclasses must implement the primary_checklist method"
  end

  def blueprint
    raise NotImplementedError, "Subclasses must implement the blueprint method"
  end

  def checklist_blueprint
    raise NotImplementedError,
          "Subclasses must implement the checklist_blueprint method"
  end
end

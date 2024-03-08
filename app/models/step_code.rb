class StepCode < ApplicationRecord
  belongs_to :permit_application, optional: Rails.env.test?

  delegate :number, to: :permit_application, prefix: :building_permit
  delegate :submitter, :jurisdiction_name, :full_address, :pid, to: :permit_application
  delegate :energy_step_required, to: :permit_application, allow_nil: true
  delegate :zero_carbon_step_required, to: :permit_application, allow_nil: true

  has_many :data_entries, class_name: "StepCodeDataEntry", dependent: :destroy
  has_many :checklists, class_name: "StepCodeChecklist", dependent: :destroy
  has_one :pre_construction_checklist, -> { where(stage: :pre_construction) }, class_name: "StepCodeChecklist"

  accepts_nested_attributes_for :data_entries
  accepts_nested_attributes_for :pre_construction_checklist

  def plan_author
    permit_application.step_code_plan_author
  end

  def plan_version
    permit_application.step_code_plan_version
  end

  def plan_date
    permit_application.step_code_plan_author
  end

  def builder
    "" #replace with a config on permit application
  end
end

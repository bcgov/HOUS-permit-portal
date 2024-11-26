class StepCode < ApplicationRecord
  belongs_to :permit_application, optional: Rails.env.test?

  delegate :number, to: :permit_application, prefix: :building_permit
  delegate :submitter,
           :jurisdiction_name,
           :full_address,
           :pid,
           to: :permit_application

  has_many :data_entries, class_name: "StepCodeDataEntry", dependent: :destroy
  has_many :checklists, class_name: "StepCodeChecklist", dependent: :destroy
  has_one :pre_construction_checklist,
          -> { where(stage: :pre_construction) },
          class_name: "StepCodeChecklist"

  accepts_nested_attributes_for :data_entries
  accepts_nested_attributes_for :pre_construction_checklist

  before_create :set_plan_fields
  validate :requires_plan_document

  def requires_plan_document
    return if permit_application.blank? #do not enforce if there is no permit application
    if permit_application.step_code_plan_document.blank?
      errors.add(
        :plan_version,
        "file is missing.  Please upload on the permit application first."
      )
      # EVENTUALLY BRING THIS LOGIC BACK ONCE WE DECIDE BEST WAY TO CONFIGURE IF A STEP CODE REQUIRES A SIGNED DOCUMENT.
      # elsif permit_application.step_code_plan_document.compliance_data.blank? ||
      #       permit_application.step_code_plan_document.compliance_data.empty?
      #   errors.add(:plan_version, "file is being verified for author and date.")
      # elsif permit_application.step_code_plan_document.compliance_data.dig("error")
      #   errors.add(:plan_version, "file uploaded failed to verify author and data due to an error with the serivce.")
    end
  end

  def set_plan_fields
    return if permit_application.blank?
    assign_attributes(
      plan_author: permit_application.step_code_plan_author,
      plan_version: permit_application.step_code_plan_version,
      plan_date: permit_application.step_code_plan_date
    )
  end

  def plan_out_of_date
    permit_application.step_code_plan_author != plan_author ||
      permit_application.step_code_plan_version != plan_version ||
      permit_application.step_code_plan_date != plan_date
  end

  def builder
    "" #replace with a config on permit application
  end

  def step_requirements
    all =
      permit_application.jurisdiction.permit_type_required_steps.where(
        permit_type: permit_application.permit_type
      )
    all.customizations.any? ? all.customizations : all
  end
end

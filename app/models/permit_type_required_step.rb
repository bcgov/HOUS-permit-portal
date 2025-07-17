class PermitTypeRequiredStep < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :permit_type
  delegate :name, to: :permit_type, prefix: true

  has_many :step_code_checklists,
           class_name: "Part9StepCode::Checklist",
           foreign_key: "step_requirement_id",
           dependent: :nullify

  before_create :nullify_invalid_checklists, if: :overriding_default?
  before_validation :set_default_steps

  def nullify_invalid_checklists
    other_requirements
      .find_by(default: true)
      .step_code_checklists
      .update_all(step_requirement_id: nil)
  end

  def overriding_default?
    other_requirements.customizations.empty? && !default
  end

  scope :customizations, -> { where(default: nil) }

  before_validation :set_default_steps

  def set_default_steps
    self.energy_step_required ||= ENV["PART_9_MIN_ENERGY_STEP"].to_i
    self.zero_carbon_step_required ||= ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i
  end

  validates :permit_type_id, uniqueness: { scope: %i[jurisdiction_id default] }

  validates :energy_step_required,
            presence: true,
            numericality: {
              greater_than_or_equal_to: ENV["PART_9_MIN_ENERGY_STEP"].to_i,
              less_than_or_equal_to: ENV["PART_9_MAX_ENERGY_STEP"].to_i
            }

  validates :zero_carbon_step_required,
            presence: true,
            numericality: {
              greater_than_or_equal_to: ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i,
              less_than_or_equal_to: ENV["PART_9_MAX_ZERO_CARBON_STEP"].to_i
            }

  def other_requirements
    PermitTypeRequiredStep.where(permit_type_id:, jurisdiction_id:)
  end
end

class JurisdictionStepRequirement < ApplicationRecord
  self.table_name = "jurisdiction_step_requirements"

  belongs_to :jurisdiction

  has_many :step_code_checklists,
           class_name: "Part9StepCode::Checklist",
           foreign_key: "step_requirement_id",
           dependent: :nullify

  before_validation :set_default_steps

  scope :customizations, -> { where(default: nil) }

  validates :jurisdiction_id, uniqueness: { scope: %i[default] }, if: :default?

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

  def set_default_steps
    self.energy_step_required ||= ENV["PART_9_MIN_ENERGY_STEP"].to_i
    self.zero_carbon_step_required ||= ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i
  end

  def other_requirements
    JurisdictionStepRequirement.where(jurisdiction_id: jurisdiction_id)
  end
end

class PermitTypeRequiredStep < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :permit_type
  delegate :name, to: :permit_type, prefix: true

  has_many :step_code_checklists,
           foreign_key: "step_requirement_id",
           dependent: :nullify

  before_create :nullify_invalid_checklists, if: :overriding_default?

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

  def other_requirements
    PermitTypeRequiredStep.where(permit_type_id:, jurisdiction_id:)
  end
end

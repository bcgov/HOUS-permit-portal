class JurisdictionTemplateRequiredStep < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :requirement_template
  delegate :label, to: :requirement_template, prefix: true

  validates :energy_step_required, presence: true
  validates :zero_carbon_step_required, presence: true
end

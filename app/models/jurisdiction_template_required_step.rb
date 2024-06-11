class JurisdictionTemplateRequiredStep < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :requirement_template

  validates :jurisdiction, presence: true
  validates :requirement_template, presence: true
  validates :energy_step_required, presence: true
  validates :zero_carbon_step_required, presence: true
end

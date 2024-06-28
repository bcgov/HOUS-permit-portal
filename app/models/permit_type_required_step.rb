class PermitTypeRequiredStep < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :permit_type
  delegate :name, to: :permit_type, prefix: true

  validates :energy_step_required, presence: true
  validates :zero_carbon_step_required, presence: true
end

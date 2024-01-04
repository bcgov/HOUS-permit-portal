class RequirementTemplate < ApplicationRecord
  belongs_to :activity
  belongs_to :permit_type

  validates :activity_id, uniqueness: { scope: :permit_type_id }
end

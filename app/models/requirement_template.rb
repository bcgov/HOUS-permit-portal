class RequirementTemplate < ApplicationRecord
  belongs_to :activity, class_name: "Activity"
  belongs_to :permit_type, class_name: "PermitType"

  validates :activity_id, uniqueness: { scope: :permit_type_id }
  validate :ensure_correct_type_for_permit_type_and_activity

  private

  def ensure_correct_type_for_permit_type_and_activity
    errors.add(:permit_type, "must be of type PermitType") unless permit_type.type == "PermitType"
    errors.add(:activity, "must be of type Activity") unless activity.type == "Activity"
  end
end

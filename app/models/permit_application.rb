class PermitApplication < ApplicationRecord
  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction
  belongs_to :building_type
  belongs_to :work_type

  delegate :permit_type, to: :building_type

  enum status: { draft: 0, submitted: 1, viewed: 2 }, _default: 0

  # Custom validation
  validate :submitter_must_have_role

  private

  def submitter_must_have_role
    errors.add(:submitter, "must have the submitter role") unless submitter&.submitter?
  end
end

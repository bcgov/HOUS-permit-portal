class PermitApplication < ApplicationRecord
  belongs_to :submitter, class_name: "User"
  belongs_to :local_jurisdiction

  # Custom validation
  validate :submitter_must_have_role

  enum permit_type: { residential: 0 }, _default: 0

  private

  def submitter_must_have_role
    errors.add(:submitter, "must have the submitter role") unless submitter&.submitter?
  end
end

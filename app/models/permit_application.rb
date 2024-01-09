class PermitApplication < ApplicationRecord
  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction

  # Custom validation
  validate :submitter_must_have_role
  enum status: { draft: 0, submitted: 1, viewed: 2 }, _default: 0

  private

  def submitter_must_have_role
    errors.add(:submitter, "must have the submitter role") unless submitter&.submitter?
  end
end

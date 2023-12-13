class PermitApplication < ApplicationRecord
  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction

  # Custom validation
  validate :submitter_must_have_role

  enum permit_type: { residential: 0 }, _default: 0
  enum building_type: {
         detatched: 0, # detached house (with or without secondary suite)
         semi_detatched: 1, # semi-detached house/duplex/townhouse/row house
         small_appartment: 2, # small apartment/houseplex
       },
       _default: 0
  enum status: { draft: 0, submitted: 1, viewed: 2 }, _default: 0

  private

  def submitter_must_have_role
    errors.add(:submitter, "must have the submitter role") unless submitter&.submitter?
  end
end

class ProjectMembership < ApplicationRecord
  belongs_to :permit_project
  belongs_to :item, polymorphic: true

  # Validations
  validates :permit_project_id,
            uniqueness: {
              scope: %i[item_id item_type],
              message: "item is already in this project"
            }

  # Scopes or methods can be added as needed, e.g.:
  # scope :for_type, ->(type) { where(item_type: type) }
end

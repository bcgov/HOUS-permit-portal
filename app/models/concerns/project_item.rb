module ProjectItem
  extend ActiveSupport::Concern

  included do
    # Future shared logic for all project items can go here.
    # For example, common scopes, validations, or methods.
    has_many :project_memberships, as: :item, dependent: :destroy
    has_many :permit_projects, through: :project_memberships
  end

  # class_methods do
  #   # Future class methods for ProjectItem
  # end

  # Define instance methods that all ProjectItems should have.
  # For example, a method to get its display name for the project context.
  # def project_item_display_name
  #   raise NotImplementedError, "#{self.class} must implement project_item_display_name"
  # end

  # def project_item_creation_date
  #   self.created_at # Assuming all items have created_at
  # end
end

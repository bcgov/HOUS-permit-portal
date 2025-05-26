class PermitProject < ApplicationRecord
  searchkick word_middle: %i[description full_address], text_end: %i[number] # number will come from primary item

  belongs_to :owner, class_name: "User"
  belongs_to :property_plan_jurisdiction, optional: true
  has_one :permit_project_payment_detail, dependent: :destroy
  has_one :payment_detail, through: :permit_project_payment_detail

  # New associations for generalized project items
  has_many :project_memberships, dependent: :destroy
  has_many :permit_applications, # Renaming from 'items' to be specific for now
           through: :project_memberships,
           source: :item,
           source_type: "PermitApplication"
  has_many :project_documents, dependent: :destroy
  # Add other item types as needed, e.g.:
  # has_many :inspections, through: :project_memberships, source: :item, source_type: "Inspection"

  accepts_nested_attributes_for :project_documents, allow_destroy: true

  # Validations, scopes, methods, etc. can be added here
  # The old validation for primary_permit_project_permit_application is removed.

  # The old delegate block is removed. Attributes will be accessed via primary_project_item.

  # Method to determine the primary project item (e.g., the first one created)
  def primary_project_item
    # This assumes project_memberships are ordered by creation or items have created_at
    # and you want the item itself, not the membership record.
    # It also assumes item has a created_at attribute for ordering.
    # The join ensures that `item` is loaded and `items.created_at` can be used for ordering.
    project_memberships.joins(:item).order("items.created_at ASC").first&.item
  end

  # Delegated helper methods are now removed.
  # Code consuming this model must now use `project.primary_project_item&.attribute_name`

  # def search_data
  #   # This needs significant rework based on how search should behave with multiple items.
  #   # For now, let's make it simple or comment out.
  #   primary_item_data = primary_project_item&.search_data || {}
  #   {
  #     description: description, # This is a direct attribute of PermitProject
  #     # Fields from primary_project_item
  #     number: primary_project_item&.number,
  #     full_address: primary_project_item&.full_address,
  #     # ... add other fields needed for search from primary_project_item
  #   }.merge(primary_item_data) # Be careful with merging, ensure no clashes or desired overrides
  # end

  # This method might no longer make sense if there can be multiple applications or item types.
  # Or it should return the primary_project_item if it's a PermitApplication.
  # def permit_application
  #   item = primary_project_item
  #   item if item.is_a?(PermitApplication)
  # end

  # TODO: Re-evaluate and re-implement search_data based on primary_project_item
  # and the possibility of multiple items of different types in the future.
end

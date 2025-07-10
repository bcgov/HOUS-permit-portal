class PermitProject < ApplicationRecord
  include Discard::Model
  searchkick word_middle: %i[title full_address pid pin] # Search configuration for PermitProject

  belongs_to :owner, class_name: "User"
  belongs_to :jurisdiction # Direct association to Jurisdiction
  belongs_to :property_plan_jurisdiction, optional: true
  has_one :permit_project_payment_detail, dependent: :destroy
  has_one :payment_detail, through: :permit_project_payment_detail

  has_many :permit_applications
  has_many :project_documents, dependent: :destroy
  has_many :step_codes

  accepts_nested_attributes_for :project_documents, allow_destroy: true

  def search_data
    {
      title: title,
      full_address: full_address,
      pid: pid,
      pin: pin,
      owner_id: owner_id,
      jurisdiction_id: jurisdiction_id,
      created_at: created_at,
      updated_at: updated_at,
      discarded: discarded_at.present?,
      phase: phase,
      forcasted_completion_date: forcasted_completion_date
    }
  end

  # This method might no longer make sense if there can be multiple applications or item types.
  # Or it should return the primary_project_item if it's a PermitApplication.
  # def permit_application
  #   item = primary_project_item
  #   item if item.is_a?(PermitApplication)
  # end

  # TODO: Re-evaluate and re-implement search_data based on primary_project_item
  # and the possibility of multiple items of different types in the future.

  # TODO: User to define the logic for this helper method
  def phase
    return "empty" if permit_applications.blank?

    permit_applications.max_by(&:pertinence_score).status
  end

  # TODO: User to define the logic for this helper method
  def forcasted_completion_date
    # Example implementation, to be defined by user
    Time.zone.now + 14.days
  end
end

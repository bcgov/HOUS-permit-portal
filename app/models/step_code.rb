class StepCode < ApplicationRecord
  include ProjectItem
  has_parent :permit_application

  # Enable search for StepCodes
  searchkick word_middle: %i[
               title
               full_address
               jurisdiction_name
               type
               permit_application_number
             ]

  belongs_to :creator,
             class_name: "User",
             foreign_key: "creator_id",
             optional: true

  # Associations
  belongs_to :permit_application, optional: true
  has_one :permit_project, through: :permit_application
  has_many :report_documents, dependent: :destroy, inverse_of: :step_code

  # Delegates for attributes from PermitApplication
  delegate :number, to: :permit_application, prefix: true, allow_nil: true

  validates :permit_application_id, uniqueness: true, allow_nil: true

  delegate :submitter,
           :newly_submitted_at,
           :status,
           :jurisdiction_heating_degree_days,
           :reference_number,
           to: :permit_application,
           allow_nil: true

  def builder
    "" #replace with a config on permit application
  end

  def primary_checklist
    raise NotImplementedError,
          "Subclasses must implement the primary_checklist method"
  end

  def blueprint
    raise NotImplementedError, "Subclasses must implement the blueprint method"
  end

  def checklist_blueprint
    raise NotImplementedError,
          "Subclasses must implement the checklist_blueprint method"
  end

  # Fields to be indexed by Searchkick
  def search_data
    {
      id: id,
      type: type,
      title: title,
      reference_number: reference_number,
      full_address: full_address,
      jurisdiction_name: jurisdiction_name,
      permit_date: permit_application&.permit_date,
      created_at: created_at,
      updated_at: updated_at,
      creator_id: creator_id,
      submitter_id: permit_application&.submitter_id,
      permit_project_id: permit_project&.id,
      jurisdiction_id: jurisdiction&.id,
      sandbox_id: permit_application&.sandbox_id
    }
  end
end

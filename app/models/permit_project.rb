class PermitProject < ApplicationRecord
  searchkick word_middle: %i[
               description
               nickname
               full_address
               permit_classifications
               submitter
               status
               review_delegatee_name
             ],
             text_end: %i[number]

  belongs_to :property_plan_local_jurisdiction, optional: true
  has_one :permit_project_payment_detail, dependent: :destroy
  has_one :payment_detail, through: :permit_project_payment_detail

  # Association for the single primary application join record
  has_one :primary_permit_project_permit_application,
          -> { primary }, # Using scope from PermitProjectPermitApplication
          class_name: "PermitProjectPermitApplication",
          dependent: :destroy

  # Association for the actual primary permit application
  has_one :primary_permit_application,
          through: :primary_permit_project_permit_application,
          source: :permit_application

  # Association for all supplemental application join records
  has_many :supplemental_permit_project_permit_applications,
           -> { supplemental }, # Using scope from PermitProjectPermitApplication
           class_name: "PermitProjectPermitApplication",
           dependent: :destroy

  # Association for all actual supplemental permit applications
  has_many :supplemental_permit_applications,
           through: :supplemental_permit_project_permit_applications,
           source: :permit_application

  # Optional: If you still want an easy way to get ALL applications
  has_many :permit_project_permit_applications, dependent: :destroy
  has_many :permit_applications, through: :permit_project_permit_applications

  # Validation: Ensure a primary permit application join record is always present
  # This validates the direct association, which is built in memory during creation.
  validates :primary_permit_project_permit_application, presence: true

  # --- Permit Project: Delegate to the PRIMARY permit application ---
  delegate :status,
           :number,
           :nickname,
           :full_address,
           :submitter,
           :jurisdiction,
           :permit_type,
           :activity,
           :submitted_at,
           :viewed_at,
           :resubmitted_at,
           :permit_type_and_activity,
           :step_code,
           :review_delegatee_name,
           :formatted_permit_classifications,
           to: :primary_permit_application,
           allow_nil: true # Consider if nil is acceptable before validation

  # Validations, scopes, methods, etc. can be added here

  def search_data
    # Ensure primary_permit_application and its search_data are present
    primary_app_search_data = primary_permit_application&.search_data || {}

    {
      # Project-specific fields
      description: description
      # Merge with primary application's search data
      # Fields from primary_permit_application will overwrite project's if names clash
      # (though 'description' is unlikely to be in primary_app_search_data directly)
    }.merge(primary_app_search_data)
  end

  def permit_application
    primary_permit_application
  end
end

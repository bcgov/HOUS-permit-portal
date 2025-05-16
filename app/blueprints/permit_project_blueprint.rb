class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :description, :created_at, :updated_at

  view :extended_with_primary_details do
    include_fields :description, :created_at, :updated_at

    # Delegated fields from primary_permit_application
    fields :status,
           :number,
           :nickname,
           :full_address,
           :pid,
           :pin,
           :reference_number,
           :submitted_at,
           :viewed_at,
           :resubmitted_at,
           :revisions_requested_at
    # :permit_type_and_activity # This is a string; prefer associations for objects

    # Delegated associations from primary_permit_application
    association :submitter, blueprint: UserBlueprint, view: :minimal
    association :permit_type, blueprint: PermitClassificationBlueprint
    association :activity, blueprint: PermitClassificationBlueprint
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base # If jurisdiction is also delegated and needed
    # association :step_code, blueprint: ->(step_code) { step_code.blueprint } # If step_code is delegated and needed

    # Direct association to the primary permit application itself, using its base view for relevant details
    association :primary_permit_application,
                blueprint: PermitApplicationBlueprint,
                view: :base
  end

  # A simpler view for general listings, adjust as needed
  view :base do
    include_fields :id,
                   :description,
                   :created_at,
                   :updated_at,
                   :number,
                   :status,
                   :nickname,
                   :full_address
    association :submitter, blueprint: UserBlueprint, view: :minimal
    association :permit_type, blueprint: PermitClassificationBlueprint
    association :activity, blueprint: PermitClassificationBlueprint
    # Optionally include primary_permit_application ID or a very minimal view of it if the full base view is too much for some contexts
    # field :primary_permit_application_id do |project, _options|
    #   project.primary_permit_application_id
    # end
  end

  # Add associations if needed, for example:
  # association :primary_permit_application, blueprint: PermitApplicationBlueprint, view: :base
  # association :supplemental_permit_applications, blueprint: PermitApplicationBlueprint, view: :base

  # If you want to include fields delegated from the primary_permit_application:
  # view :extended do
  #   fields :status, :number, :nickname, :full_address, :permit_type_and_activity
  #   # These fields are available if PermitProject delegates them to primary_permit_application
  # end
end

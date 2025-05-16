class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :description, :created_at, :updated_at

  # Add associations if needed, for example:
  # association :primary_permit_application, blueprint: PermitApplicationBlueprint, view: :base
  # association :supplemental_permit_applications, blueprint: PermitApplicationBlueprint, view: :base

  # If you want to include fields delegated from the primary_permit_application:
  # view :extended do
  #   fields :status, :number, :nickname, :full_address, :permit_type_and_activity
  #   # These fields are available if PermitProject delegates them to primary_permit_application
  # end
end

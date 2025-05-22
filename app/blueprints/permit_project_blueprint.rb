class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :description, :created_at, :updated_at
end

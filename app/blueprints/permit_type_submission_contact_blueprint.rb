class PermitTypeSubmissionContactBlueprint < Blueprinter::Base
  identifier :id
  fields :email, :permit_type_id, :confirmed_at
end

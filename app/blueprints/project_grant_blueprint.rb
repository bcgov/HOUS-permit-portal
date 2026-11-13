class ProjectGrantBlueprint < Blueprinter::Base
  identifier :id

  fields :kind,
         :project_membership_id,
         :permit_application_id,
         :requirement_block_id
end

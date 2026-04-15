class PermitProjectCollaborationBlueprint < Blueprinter::Base
  identifier :id
  association :collaborator, blueprint: CollaboratorBlueprint
end

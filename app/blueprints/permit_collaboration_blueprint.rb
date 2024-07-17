# frozen_string_literal: true

class PermitCollaborationBlueprint < Blueprinter::Base
  identifier :id
  fields :collaboration_type, :collaborator_type, :assigned_requirement_block_id

  view :base do
    association :collaborator, blueprint: CollaboratorBlueprint
  end

  view :extended do
    association :permit_application, blueprint: PermitApplicationBlueprint, view: :base
  end
end

# frozen_string_literal: true

class PermitCollaborationBlueprint < Blueprinter::Base
  identifier :id
  fields :collaboration_type,
         :collaborator_type,
         :assigned_requirement_block_id,
         :created_at,
         :updated_at

  view :base do
    fields :assigned_requirement_block_name
    association :collaborator, blueprint: CollaboratorBlueprint
  end

  view :extended do
    include_view :base
    association :permit_application,
                blueprint: PermitApplicationBlueprint,
                view: :base
  end
end

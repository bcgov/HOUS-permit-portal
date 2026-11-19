# frozen_string_literal: true

class PermitBlockStatusBlueprint < Blueprinter::Base
  identifier :id
  fields :collaboration_type,
         :requirement_block_id,
         :permit_application_id,
         :status,
         :created_at,
         :updated_at
end

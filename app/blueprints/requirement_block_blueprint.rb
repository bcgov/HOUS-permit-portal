class RequirementBlockBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :sign_off_role, :reviewer_role, :created_at, :updated_at

  field :form_json do |requirement_block|
    requirement_block.to_form_json
  end

  association :requirements, blueprint: RequirementBlueprint
end

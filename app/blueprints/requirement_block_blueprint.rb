class RequirementBlockBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :sign_off_role, :reviewer_role, :updated_at

  view :extended do
    association :requirements, blueprint: RequirementBlueprint

    field :form_json do |requirement_block|
      requirement_block.to_form_json
    end
  end
end

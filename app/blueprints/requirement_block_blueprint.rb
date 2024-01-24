class RequirementBlockBlueprint < Blueprinter::Base
  identifier :id
  fields :name,
         :description,
         :display_name,
         :display_description,
         :sign_off_role,
         :reviewer_role,
         :created_at,
         :updated_at

  field :association_list, name: :associations

  field :form_json do |requirement_block|
    requirement_block.to_form_json
  end

  association :requirements, blueprint: RequirementBlueprint
end

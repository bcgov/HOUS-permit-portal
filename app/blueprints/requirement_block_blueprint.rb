class RequirementBlockBlueprint < Blueprinter::Base
  identifier :id
  fields :name,
         :sku,
         :description,
         :display_name,
         :display_description,
         :sign_off_role,
         :reviewer_role,
         :created_at,
         :updated_at

  field :association_list, name: :associations

  field :form_json do |requirement_block, options|
    requirement_block.to_form_json(options[:parent_key])
  end

  association :requirements, blueprint: RequirementBlueprint
end

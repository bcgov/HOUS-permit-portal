class RequirementBlockBlueprint < Blueprinter::Base
  identifier :id
  fields :name,
         :first_nations,
         :sku,
         :description,
         :visibility,
         :display_name,
         :display_description,
         :sign_off_role,
         :reviewer_role,
         :created_at,
         :updated_at,
         :discarded_at

  field :association_list, name: :associations

  field :form_json do |requirement_block, options|
    requirement_block.to_form_json(options[:parent_key])
  end

  association :requirements, blueprint: RequirementBlueprint
end

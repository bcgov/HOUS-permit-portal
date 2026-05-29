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
         :updated_at,
         :discarded_at

  field :association_list, name: :associations

  field :form_json do |requirement_block, options|
    requirement_block.to_form_json(options[:parent_key])
  end

  association :requirements, blueprint: RequirementBlueprint
  association :requirement_documents, blueprint: RequirementDocumentBlueprint

  # Authoring surface (Requirements Library). Identical to the default view but
  # renders requirements through their :authoring view so question-bank linkage
  # metadata (is_shared, question_definition_id, local_overrides,
  # shared_review_state) is included. The publish snapshot keeps using the
  # default view, so TemplateVersion#requirement_blocks_json is unaffected.
  view :authoring do
    exclude :requirements
    association :requirements, blueprint: RequirementBlueprint, view: :authoring
  end
end

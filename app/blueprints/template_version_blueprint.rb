class TemplateVersionBlueprint < Blueprinter::Base
  identifier :id
  fields :status, :version_date, :created_at, :updated_at

  view :extended do
    fields :denormalized_template_json, :form_json, :requirement_blocks_json
  end
end

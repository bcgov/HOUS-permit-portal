class TemplateVersionBlueprint < Blueprinter::Base
  identifier :id
  fields :status,
         :deprecation_reason,
         :version_date,
         :created_at,
         :updated_at,
         :version_date,
         :label

  field :version_date do |template_version|
    # Parse version date in BC time
    template_version
      .version_date
      .in_time_zone("Pacific Time (US & Canada)")
      .to_time
  end

  view :extended do
    fields :denormalized_template_json, :form_json, :requirement_blocks_json
  end
end

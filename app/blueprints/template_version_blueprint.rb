class TemplateVersionBlueprint < Blueprinter::Base
  identifier :id
  fields :status,
         :deprecation_reason,
         :created_at,
         :updated_at,
         :version_date,
         :label,
         :first_nations,
         :requirement_template_id

  field :early_access do |template_version|
    template_version.early_access?
  end

  field :public do |template_version|
    template_version.public?
  end

  field :version_date do |template_version|
    # Parse version date in BC time
    template_version.version_date_in_province_time
  end

  view :extended do
    fields :denormalized_template_json, :form_json, :requirement_blocks_json

    field :latest_version_id do |template_version|
      template_version.latest_version&.id
    end
  end

  view :external_api do
    excludes :deprecation_reason, :created_at, :updated_at, :label
  end
end

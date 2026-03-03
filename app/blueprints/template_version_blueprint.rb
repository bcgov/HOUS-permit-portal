class TemplateVersionBlueprint < Blueprinter::Base
  identifier :id
  fields :status,
         :deprecation_reason,
         :created_at,
         :updated_at,
         :version_date,
         :label,
         :requirement_template_id,
         :change_notes,
         :change_significance,
         :notification_scope,
         :publicly_previewable

  field :early_access do |template_version|
    template_version.early_access?
  end

  field :version_date do |template_version|
    # Parse version date in BC time
    template_version.version_date_in_province_time
  end

  field :has_unresolved_feedbacks do |template_version|
    template_version.draft? ? template_version.has_unresolved_feedbacks? : false
  end

  field :feedbacks_count do |template_version|
    if template_version.draft?
      template_version.template_version_feedbacks.count
    else
      0
    end
  end

  view :extended do
    fields :denormalized_template_json, :form_json, :requirement_blocks_json

    field :latest_version_id do |template_version|
      template_version.latest_version&.id
    end

    association :template_version_feedbacks,
                blueprint: TemplateVersionFeedbackBlueprint,
                if: ->(_field_name, tv, _options) { tv.draft? }

    association :template_version_previews,
                blueprint: TemplateVersionPreviewBlueprint,
                if: ->(_field_name, tv, _options) { tv.draft? }

    association :assignee,
                blueprint: UserBlueprint,
                view: :minimal,
                if: ->(_field_name, tv, _options) do
                  tv.draft? && tv.assignee.present?
                end
  end

  view :external_api do
    excludes :deprecation_reason,
             :created_at,
             :updated_at,
             :label,
             :change_notes,
             :change_significance,
             :notification_scope,
             :publicly_previewable
  end
end

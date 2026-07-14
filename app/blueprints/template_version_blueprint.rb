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

  field :version_date do |template_version|
    # Parse version date in BC time
    template_version.version_date_in_province_time
  end

  field :summary do |template_version|
    template_version.snapshot_summary
  end

  view :list do
    field :requires_project_meeting do |template_version, options|
      template_version.requires_project_meeting_for_jurisdiction?(
        options[:jurisdiction_id],
        options[:sandbox]
      )
    end

    field :disabled_by_jurisdiction do |template_version, options|
      template_version.disabled_for_jurisdiction?(
        options[:jurisdiction_id],
        options[:sandbox]
      )
    end
  end

  view :extended do
    include_view :list

    field :outline do |template_version|
      template_version.snapshot_outline(display: template_version.draft?)
    end

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

  view :form_preview do
    include_view :list

    field :form_json do |template_version|
      template_version.snapshot_form_json(display: template_version.draft?)
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
             :publicly_previewable,
             :summary
  end

  view :standardization_preview do
    field(:is_available_for_adoption) do |tv|
      tv.requirement_template&.published_template_version.present?
    end
  end
end

class PermitApplicationBlueprint < Blueprinter::Base
  view :base do
    identifier :id
    fields :nickname,
           :status,
           :number,
           :created_at,
           :updated_at,
           :viewed_at,
           :full_address,
           :pid,
           :pin,
           :zipfile_size,
           :zipfile_name,
           :zipfile_url,
           :reference_number,
           :submitted_at,
           :resubmitted_at,
           :revisions_requested_at,
           :missing_pdfs,
           :template_nickname,
           :discarded_at,
           :days_in_queue

    association :sandbox, blueprint: SandboxBlueprint

    field :tags do |pa, _options|
      pa.template_tag_list
    end
    association :submission_versions,
                blueprint: SubmissionVersionBlueprint,
                view: :base
    association :submitter, blueprint: UserBlueprint, view: :minimal

    field :using_current_template_version do |pa, _options|
      pa.using_current_template_version
    end

    field :project_id do |pa, _options|
      pa.permit_project&.id
    end

    field :project_number do |pa, _options|
      pa.permit_project&.number
    end

    field :inbox_sort_order, default: nil
    field :allowed_manual_transitions, default: []
  end

  view :project_base do
    include_view :base
    association :permit_collaborations,
                blueprint: PermitCollaborationBlueprint,
                view: :base do |pa, options|
      collabs = pa.permit_collaborations(options[:current_user])
      if options[:current_user]&.review_staff?
        collabs
      else
        collabs.select(&:submission?)
      end
    end
  end

  view :jurisdiction_review_inbox do
    include_view :base

    association :supporting_documents, blueprint: SupportingDocumentBlueprint
    association :permit_collaborations,
                blueprint: PermitCollaborationBlueprint,
                view: :base do |pa, _options|
      pa.permit_collaborations.where(collaboration_type: :review)
    end
    association :submitter, blueprint: UserBlueprint, view: :minimal
  end

  view :extended do
    include_view :base
    fields :formatted_compliance_data,
           :front_end_form_update,
           :form_customizations

    association :submitter, blueprint: UserBlueprint, view: :minimal

    field :is_fully_loaded do |_pa, _options|
      true
    end

    field :form_json do |pa, options|
      pa.form_json(current_user: options[:current_user])
    end

    field :submission_data do |pa, options|
      pa.formatted_submission_data(current_user: options[:current_user])
    end

    association :template_version, blueprint: TemplateVersionBlueprint
    association :published_template_version, blueprint: TemplateVersionBlueprint

    field :template_version_disabled_by_jurisdiction do |pa, _options|
      pa.template_version_disabled_by_jurisdiction?
    end

    association :supporting_documents,
                blueprint: SupportingDocumentBlueprint do |pa, options|
      pa.supporting_documents_for_submitter_based_on_user_permissions(
        pa.supporting_documents,
        user: options[:current_user]
      )
    end
    association :all_submission_version_completed_supporting_documents,
                blueprint: SupportingDocumentBlueprint do |pa, options|
      pa.supporting_documents_for_submitter_based_on_user_permissions(
        pa.all_submission_version_completed_supporting_documents,
        user: options[:current_user]
      )
    end
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
    association :step_code, blueprint: ->(step_code) { step_code.blueprint }
    association :permit_collaborations,
                blueprint: PermitCollaborationBlueprint,
                view: :base do |pa, options|
      collabs = pa.permit_collaborations(options[:current_user])
      if options[:current_user]&.review_staff?
        collabs
      else
        collabs.select(&:submission?)
      end
    end
    association :permit_block_statuses, blueprint: PermitBlockStatusBlueprint
    association :submission_versions,
                blueprint: SubmissionVersionBlueprint,
                view: :extended
  end

  view :pdf_generation do
    include_view :extended

    field :form_json do |pa, options|
      options[:form_json].present? ? options[:form_json] : pa.form_json
    end

    field :submitted_at do |pa, options|
      options[:submitted_at].present? ? options[:submitted_at] : pa.submitted_at
    end

    field :submission_data do |pa, options|
      if options[:submission_data].present?
        options[:submission_data]
      else
        pa.formatted_submission_data
      end
    end
  end

  view :jurisdiction_review_extended do
    include_view :extended
    # reinclude fields to show all data for reviewers, which were filtered out in the extended view due to collaboration
    field :form_json
    field :submission_data do |pa, _options|
      pa.formatted_submission_data
    end
    association :permit_collaborations,
                blueprint: PermitCollaborationBlueprint,
                view: :base do |pa, _options|
      pa.permit_collaborations
    end
    association :all_submission_version_completed_supporting_documents,
                blueprint: SupportingDocumentBlueprint
    association :submission_versions,
                blueprint: SubmissionVersionBlueprint,
                view: :review_extended
  end

  view :compliance_update do
    identifier :id
    fields :formatted_compliance_data, :front_end_form_update
  end

  view :external_api do
    identifier :id
    fields :status,
           :number,
           :full_address,
           :pid,
           :pin,
           :reference_number,
           :submitted_at,
           :resubmitted_at

    field :submission_data do |pa, _options|
      pa.formatted_submission_data_for_external_use
    end

    field :tags do |pa, _options|
      pa.template_tag_list
    end

    field :raw_h2k_files do |pa, _options|
      pa.formatted_raw_h2k_files_for_external_use
    end

    association :template_version,
                blueprint: TemplateVersionBlueprint,
                view: :external_api,
                name: :permit_version
    association :submitter,
                blueprint: UserBlueprint,
                view: :external_api,
                name: :account_holder
  end

  view :supporting_docs_update do
    identifier :id

    fields :missing_pdfs, :zipfile_size, :zipfile_name, :zipfile_url

    association :supporting_documents,
                blueprint: SupportingDocumentBlueprint do |pa, options|
      pa.supporting_documents_for_submitter_based_on_user_permissions(
        pa.supporting_documents,
        user: options[:current_user]
      )
    end
    association :all_submission_version_completed_supporting_documents,
                blueprint: SupportingDocumentBlueprint do |pa, options|
      pa.supporting_documents_for_submitter_based_on_user_permissions(
        pa.all_submission_version_completed_supporting_documents,
        user: options[:current_user]
      )
    end
  end
end

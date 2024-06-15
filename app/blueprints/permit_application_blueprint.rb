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
           :submitted_at
    association :permit_type, blueprint: PermitClassificationBlueprint
    association :activity, blueprint: PermitClassificationBlueprint

    field :indexed_using_current_template_version do |pa, options|
      # Indexed data is used to prevent N extra queries on every search
      pa.indexed_using_current_template_version
    end
  end

  view :jurisdiction_review_inbox do
    include_view :base

    association :submitter, blueprint: UserBlueprint, view: :base
    association :supporting_documents, blueprint: SupportingDocumentBlueprint
  end

  view :extended do
    include_view :base
    fields :form_json, :submission_data, :formatted_compliance_data, :front_end_form_update, :form_customizations

    field :is_fully_loaded do |pa, options|
      true
    end

    association :submitter, blueprint: UserBlueprint, view: :base
    association :template_version, blueprint: TemplateVersionBlueprint
    association :published_template_version, blueprint: TemplateVersionBlueprint
    association :supporting_documents, blueprint: SupportingDocumentBlueprint
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
    association :step_code, blueprint: StepCodeBlueprint
  end

  view :compliance_update do
    identifier :id
    fields :formatted_compliance_data, :front_end_form_update
  end

  view :external_api do
    identifier :id
    fields :status, :number, :full_address, :pid, :pin, :reference_number, :submitted_at

    field :submission_data do |pa, _options|
      pa.formatted_submission_data_for_external_use
    end

    field :permit_classifications do |pa, _options|
      pa.formatted_permit_classifications
    end

    field :raw_h2k_files do |pa, _options|
      pa.formatted_raw_h2k_files_for_external_use
    end

    association :template_version, blueprint: TemplateVersionBlueprint, view: :external_api, name: :permit_version
    association :submitter, blueprint: UserBlueprint, view: :external_api
    association :permit_type, blueprint: PermitClassificationBlueprint
    association :activity, blueprint: PermitClassificationBlueprint, name: :activity_type
  end
end

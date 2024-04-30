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
  end

  view :jurisdiction_review_inbox do
    include_view :base

    association :submitter, blueprint: UserBlueprint
    association :supporting_documents, blueprint: SupportingDocumentBlueprint
  end

  view :extended do
    include_view :base
    fields :form_json,
           :submission_data,
           :formatted_compliance_data,
           :front_end_form_update,
           :form_customizations

    field :is_fully_loaded do |pa, options|
      true
    end

    association :submitter, blueprint: UserBlueprint
    association :supporting_documents, blueprint: SupportingDocumentBlueprint
    association :jurisdiction, blueprint: JurisdictionBlueprint
    association :step_code, blueprint: StepCodeBlueprint
  end

  view :compliance_update do
    identifier :id
    fields :formatted_compliance_data, :front_end_form_update
  end

  view :external_api do
    identifier :id
    fields :nickname,
           :status,
           :number,
           :full_address,
           :pid,
           :pin,
           :zipfile_size,
           :zipfile_name,
           :zipfile_url,
           :reference_number,
           :submitted_at

    field :submission_data do |pa, _options|
      pa.formatted_submission_data_for_external_use
    end

    field :permit_classifications do |pa, _options|
      pa.formatted_permit_classifications
    end

    association :permit_type, blueprint: PermitClassificationBlueprint
    association :activity, blueprint: PermitClassificationBlueprint
  end
end

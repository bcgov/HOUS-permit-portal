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
    association :supporting_documents, blueprint: SupportingDocumentBlueprint
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
    association :step_code, blueprint: StepCodeBlueprint
  end

  view :compliance_update do
    identifier :id
    fields :formatted_compliance_data, :front_end_form_update
  end
end

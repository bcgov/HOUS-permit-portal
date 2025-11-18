class PreCheckBlueprint < Blueprinter::Base
  identifier :id

  fields :external_id,
         :status,
         :full_address,
         :pid,
         :title,
         :permit_application_id,
         :service_partner,
         :eula_accepted,
         :consent_to_send_drawings,
         :consent_to_share_with_jurisdiction,
         :consent_to_research_contact,
         :assessment_result,
         :viewed_at,
         :viewer_url,
         :created_at,
         :updated_at

  field :expired do |pre_check|
    pre_check.expired?
  end

  association :creator, blueprint: UserBlueprint
  association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
  association :permit_type, blueprint: PermitClassificationBlueprint
  association :design_documents, blueprint: DesignDocumentBlueprint
end

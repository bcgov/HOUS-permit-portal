class PreCheckBlueprint < Blueprinter::Base
  identifier :id

  fields :cert_number,
         :phase,
         :full_address,
         :permit_application_id,
         :service_partner,
         :eula_accepted,
         :consent_to_send_drawings,
         :consent_to_share_with_jurisdiction,
         :consent_to_research_contact,
         :created_at,
         :updated_at

  association :creator, blueprint: UserBlueprint
  association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
  association :permit_type, blueprint: PermitClassificationBlueprint
  association :design_documents, blueprint: DesignDocumentBlueprint
end

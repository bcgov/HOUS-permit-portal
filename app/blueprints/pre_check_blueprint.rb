class PreCheckBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :cert_number,
         :permit_date,
         :phase,
         :full_address,
         :permit_application_id,
         :jurisdiction_id,
         :checklist,
         :created_at,
         :updated_at

  association :creator, blueprint: UserBlueprint
  association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
end

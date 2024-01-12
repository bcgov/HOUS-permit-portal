class PermitApplicationBlueprint < Blueprinter::Base
  identifier :id
  fields :nickname,
         :permit_type_code,
         :permit_type_name,
         :activity_code,
         :activity_name,
         :status,
         :number,
         :created_at,
         :updated_at,
         :requirements
  association :jurisdiction, blueprint: JurisdictionBlueprint
  association :submitter, blueprint: UserBlueprint
end

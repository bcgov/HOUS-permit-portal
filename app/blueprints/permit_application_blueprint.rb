class PermitApplicationBlueprint < Blueprinter::Base
  identifier :id
  fields :nickname,
         :status,
         :number,
         :created_at,
         :updated_at,
         :requirements,
         :full_address,
         :pid,
         :pin,
         :submission_data,
         :submitted_at
  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint
  association :jurisdiction, blueprint: JurisdictionBlueprint
  association :submitter, blueprint: UserBlueprint
end

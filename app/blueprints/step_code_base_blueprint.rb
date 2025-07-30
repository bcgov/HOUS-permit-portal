class StepCodeBaseBlueprint < Blueprinter::Base
  identifier :id

  fields :type,
         :project_name,
         :project_identifier,
         :full_address,
         :jurisdiction_name,
         :permit_date

  association :permit_application,
              blueprint: PermitApplicationBlueprint,
              view: :base

  association :creator, blueprint: UserBlueprint
end

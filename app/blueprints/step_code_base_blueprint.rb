class StepCodeBaseBlueprint < Blueprinter::Base
  identifier :id

  fields :type,
         :created_at,
         :updated_at,
         :title,
         :reference_number,
         :full_address,
         :jurisdiction_name,
         :permit_date,
         :phase

  association :permit_application,
              blueprint: PermitApplicationBlueprint,
              view: :base

  association :creator, blueprint: UserBlueprint

  association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base

  association :report_documents, blueprint: ReportDocumentBlueprint
end

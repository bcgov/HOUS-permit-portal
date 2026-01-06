class PdfFormBlueprint < Blueprinter::Base
  identifier :id

  fields :form_type,
         :status,
         :created_at,
         :pdf_generation_status,
         :project_number,
         :model,
         :site,
         :lot,
         :address

  # [OVERHEATING AUDIT] Can you confirm that there is no duplicated data between the form_json and the new columns?
  field :form_json
  field :pdf_file_data
  field :user_id

  association :overheating_documents, blueprint: OverheatingDocumentBlueprint

  view :pdf_generation do
    fields :id,
           :form_type,
           :status,
           :created_at,
           :user_id,
           :project_number,
           :model,
           :site,
           :lot,
           :address

    field :form_json
  end
end

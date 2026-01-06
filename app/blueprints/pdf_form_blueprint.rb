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

  field :form_json do |pdf_form|
    exclude_duplicated_fields(pdf_form.form_json)
  end

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

    field :form_json do |pdf_form|
      exclude_duplicated_fields(pdf_form.form_json)
    end
  end

  private

  def self.exclude_duplicated_fields(json)
    return json unless json.is_a?(Hash)
    json = json.deep_dup
    json.delete("project_number")
    json.delete("projectNumber")
    if json["building_location"].is_a?(Hash)
      json["building_location"] = json["building_location"].except(
        "model",
        "site",
        "lot",
        "address"
      )
    end
    if json["buildingLocation"].is_a?(Hash)
      json["buildingLocation"] = json["buildingLocation"].except(
        "model",
        "site",
        "lot",
        "address"
      )
    end
    json
  end
end

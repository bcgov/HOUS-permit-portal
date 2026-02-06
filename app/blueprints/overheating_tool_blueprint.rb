class OverheatingToolBlueprint < Blueprinter::Base
  identifier :id

  fields :form_type, :created_at, :discarded_at

  field :pdf_generation_status do |tool, _options|
    tool.pdf_generation_status
  end

  field :form_json
  field :pdf_file_data
  field :user_id

  association :overheating_documents, blueprint: OverheatingDocumentBlueprint

  view :pdf_generation do
    fields :id, :form_type, :created_at, :user_id

    field :pdf_generation_status do |tool, _options|
      tool.pdf_generation_status
    end

    field :form_json
  end
end

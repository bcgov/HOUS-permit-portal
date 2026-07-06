class ReportDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :updated_at, :step_code_id, :stale

  field :file, transformer: Transformers::FileAttachmentTransformer
end

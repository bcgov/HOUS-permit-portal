module Transformers
  class FileAttachmentTransformer < Blueprinter::Transformer
    def transform(hash, object, _options)
      # This assumes the 'object' passed is the document itself (e.g., ProjectDocument or RequirementDocument)
      # and it responds to file_id, file_data, file_size, file_name, file_type.
      hash[:id] = object.file_id
      hash[:storage] = object.file_data&.dig("storage")
      hash[:metadata] = {
        size: object.file_size,
        filename: object.file_name,
        mime_type: object.file_type
      }
    end
  end
end

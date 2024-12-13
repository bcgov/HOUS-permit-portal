class Part3StepCode::DocumentReferenceBlueprint < Blueprinter::Base
  identifier :id
  fields :document_type,
         :document_type_description,
         :issued_for,
         :document_name,
         :date_issued,
         :prepared_by
end

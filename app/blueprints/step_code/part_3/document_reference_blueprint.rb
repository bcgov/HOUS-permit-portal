class StepCode::Part3::DocumentReferenceBlueprint < Blueprinter::Base
  identifier :id
  fields :document_type,
         :document_type_description,
         :issued_for,
         :document_name,
         :date_issued,
         :prepared_by

  view :metrics_export do
    exclude :prepared_by
  end
end

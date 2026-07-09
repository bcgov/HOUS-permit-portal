class StepCode::Part3::ChecklistSummaryBlueprint < Blueprinter::Base
  identifier :id

  fields :stage, :status, :section_completion_status, :updated_at
end

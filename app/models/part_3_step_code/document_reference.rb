class Part3StepCode::DocumentReference < ApplicationRecord
  self.table_name = "document_references"

  belongs_to :checklist
end

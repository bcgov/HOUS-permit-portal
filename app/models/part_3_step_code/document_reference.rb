class Part3StepCode::DocumentReference < ApplicationRecord
  self.table_name = "document_references"

  belongs_to :checklist

  enum :document_type,
       %i[architectural_drawing mechanical_drawing electrical_drawing other]

  validates :document_type_description, presence: true, if: :other?
  validates :issued_for, presence: true, if: :other?
  validates :document_type,
            uniqueness: {
              scope: :checklist_id
            },
            unless: :other?
end

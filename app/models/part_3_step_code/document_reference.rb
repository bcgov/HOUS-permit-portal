module Part3StepCode
  class DocumentReference < ApplicationRecord
    belongs_to :checklist
  end
end

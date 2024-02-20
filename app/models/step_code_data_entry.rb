class StepCodeDataEntry < ApplicationRecord
  include H2kFileUploader.Attachment(:h2k_file)

  belongs_to :step_code

  enum stage: %i[proposed as_built]

  before_create :set_stage

  def set_stage
    self.stage = :proposed
  end
end

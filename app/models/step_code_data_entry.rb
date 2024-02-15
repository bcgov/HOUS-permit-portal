class StepCodeDataEntry < ApplicationRecord
  include FileUploader.Attachment(:h2k_file)

  belongs_to :step_code

  enum stage: %i[proposed as_built]
end

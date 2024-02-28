class SupportingDocument < ApplicationRecord
  belongs_to :permit_application
  include FileUploader.Attachment(:file)

  scope :file_ids_with_regex, ->(regex_pattern) { where("file_data ->> 'id' ~ ?", regex_pattern) }
  scope :without_compliance, -> { where("compliance_data = '{}' OR compliance_data is NULL") }
end

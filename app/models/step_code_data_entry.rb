class StepCodeDataEntry < ApplicationRecord
  include H2kFileUploader.Attachment(:h2k_file)

  belongs_to :step_code

  enum stage: %i[proposed as_built]

  before_create :set_stage

  def set_stage
    self.stage = :proposed
  end

  def h2k_file_id
    h2k_file_data.dig("id")
  end

  def h2k_file_size
    h2k_file_data.dig("metadata", "size")
  end

  def h2k_file_name
    h2k_file_data.dig("metadata", "filename")
  end

  def h2k_file_type
    h2k_file_data.dig("metadata", "mime_type")
  end

  def h2k_file_url
    h2k_file&.url(
      public: false,
      expires_in: 3600,
      response_content_disposition:
        "attachment; filename=\"#{h2k_file.original_filename}\""
    )
  end
end

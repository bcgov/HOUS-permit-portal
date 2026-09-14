require "zip"

class StepCodeFileUploadZipService
  # ponytail: builds the zip in the request. If a range is too large for the
  # web timeout, move this onto SupportingDocumentsZipDownloadJob.
  FILE_REQUIREMENT_CODES = %w[
    energy_step_code_report_file
    energy_step_code_h2000_file
  ].freeze

  def initialize(range:)
    @range = range
  end

  def zip
    used_names = Hash.new(0)
    buffer =
      Zip::OutputStream.write_buffer do |zio|
        documents.find_each do |document|
          next unless current_on_application?(document)

          write_entry(zio, document, used_names)
        end
      end
    buffer.rewind
    buffer.string
  end

  def zip_filename
    "step_code_file_uploads_#{@range.slug}_#{Date.current.iso8601}.zip"
  end

  private

  def documents
    rel =
      SupportingDocument
        .with_file
        .includes(:permit_application)
        .where(
          FILE_REQUIREMENT_CODES.map { "data_key LIKE ?" }.join(" OR "),
          *FILE_REQUIREMENT_CODES.map { |code| "%#{code}" }
        )
    @range.apply(rel, "supporting_documents.created_at")
  end

  def current_on_application?(document)
    permit_application = document.permit_application
    return false unless permit_application

    current_file_ids(permit_application).include?(document.id.to_s)
  end

  def current_file_ids(permit_application)
    @current_file_ids ||= {}
    @current_file_ids[permit_application.id] ||= Array(
      permit_application.supporting_doc_ids_from_submission_data
    ).compact.map(&:to_s).to_set
  end

  def write_entry(zio, document, used_names)
    uploaded = document.file
    return if uploaded.blank?

    zio.put_next_entry(unique_entry_name(document, used_names))
    uploaded.open { |io| IO.copy_stream(io, zio) }
  rescue StandardError => e
    Rails.logger.error(
      "StepCodeFileUploadZipService skipped #{document.id}: #{e.message}"
    )
  end

  def unique_entry_name(document, used_names)
    filename =
      File.basename(document.standardized_filename.presence || "download")
    basename = File.basename(filename, ".*")
    extension = File.extname(filename)
    candidate = filename
    suffix = 1

    while used_names[candidate].positive?
      suffix += 1
      candidate = "#{basename} (#{suffix})#{extension}"
    end

    used_names[candidate] += 1
    candidate
  end
end

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
        application_documents.find_each do |document|
          next unless current_on_application?(document)

          write_uploaded(
            zio,
            document.file,
            document.standardized_filename,
            used_names
          )
        end
        h2k_entries.find_each do |data_entry|
          next unless data_entry.h2k_file_attacher&.attached?

          write_uploaded(
            zio,
            data_entry.h2k_file,
            data_entry.h2k_file_name,
            used_names
          )
        end
      end
    buffer.rewind
    buffer.string
  end

  def zip_filename
    "step_code_file_uploads_#{@range.slug}_#{Date.current.iso8601}.zip"
  end

  private

  def completed_checklists
    @range.apply(
      Part9StepCode::Checklist.completed_live,
      "part_9_step_code_checklists.stage_completed_at"
    )
  end

  def application_documents
    application_ids =
      completed_checklists
        .joins(:step_code)
        .where.not(step_codes: { permit_application_id: nil })
        .distinct
        .pluck("step_codes.permit_application_id")

    SupportingDocument
      .with_file
      .includes(:permit_application)
      .where(permit_application_id: application_ids)
      .where(
        FILE_REQUIREMENT_CODES.map { "data_key LIKE ?" }.join(" OR "),
        *FILE_REQUIREMENT_CODES.map { |code| "%#{code}" }
      )
  end

  def h2k_entries
    Part9StepCode::DataEntry
      .where(checklist_id: completed_checklists.select(:id))
      .where.not(h2k_file_data: nil)
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

  def write_uploaded(zio, uploaded, filename, used_names)
    return if uploaded.blank?

    zio.put_next_entry(unique_entry_name(filename, used_names))
    uploaded.open { |io| IO.copy_stream(io, zio) }
  rescue StandardError => e
    Rails.logger.error(
      "StepCodeFileUploadZipService skipped #{filename}: #{e.message}"
    )
  end

  def unique_entry_name(filename, used_names)
    filename = File.basename(filename.presence || "download")
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

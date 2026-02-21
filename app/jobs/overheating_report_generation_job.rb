require "open3"
require "json"
require "fileutils"

class OverheatingReportGenerationJob
  include Sidekiq::Worker
  include PdfRenderer

  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    # only lock on the first argument, which is the overheating tool id
    # this will prevent multiple jobs from running for the same overheating tool
    [args[0]]
  end

  def perform(overheating_tool_id)
    overheating_tool = OverheatingTool.find(overheating_tool_id)

    return if overheating_tool.blank?

    generation_directory_path = Rails.root.join("tmp/files")
    asset_directory_path = Rails.root.join("public")

    ensure_directory_exists(generation_directory_path)

    # Convert data to JSON string
    application_filename = "overheating_tool_#{overheating_tool.id}.pdf"

    # Remove stale/partial PDF if it exists
    FileUtils.rm_f(generation_directory_path.join(application_filename))

    pdf_json_data = {
      overheatingTool:
        camelize_response(
          OverheatingToolBlueprint.render_as_json(
            overheating_tool,
            view: :pdf_generation
          )
        ),
      meta: {
        generationPaths: {
          overheatingTool:
            generation_directory_path.join(application_filename).to_s
        },
        assetDirectoryPath: asset_directory_path.to_s
      }
    }.to_json

    form_json_data = overheating_tool.form_json
    unless form_json_data.is_a?(Hash)
      Rails.logger.error "OverheatingTool #{overheating_tool.id} has invalid form_json: expected Hash, got #{form_json_data.class}"
      form_json_data = {}
    end

    submission_versions_data = [
      {
        json_data: form_json_data,
        pdf_json_data: pdf_json_data,
        application_filename: application_filename
      }
    ]

    submission_versions_data.each do |data_with_pdf|
      generate_pdfs(data_with_pdf, generation_directory_path, overheating_tool)
    end
  end

  def store_pdf(overheating_tool, path)
    return unless File.exist?(path) && File.size(path).positive?

    File.open(path, "rb") do |file|
      overheating_tool.update!(
        pdf_file: file,
        pdf_generation_status: :completed
      )
    end
  ensure
    FileUtils.rm_f(path)
  end

  def generate_pdfs(
    json_data_with_pdfs,
    generation_directory_path,
    overheating_tool
  )
    overheating_tool.pdf_generation_status_generating!

    pdf_json_data = json_data_with_pdfs[:pdf_json_data]
    application_filename = json_data_with_pdfs[:application_filename]
    json_payload = JSON.parse(pdf_json_data)

    json_filename =
      write_json_to_tmp(
        generation_directory_path,
        "pdf_json_data_#{SecureRandom.hex(8)}.json",
        json_payload
      )

    exit_status = run_node_pdf_renderer(json_filename)

    if exit_status.success?
      path = "#{generation_directory_path}/#{application_filename}"
      store_pdf(overheating_tool, path)
    else
      overheating_tool.pdf_generation_status_failed!
      err =
        "Pdf generation process failed for OverheatingTool #{overheating_tool.id}. Exit status: #{exit_status}"
      Rails.logger.error err
      raise err
    end
  end
end

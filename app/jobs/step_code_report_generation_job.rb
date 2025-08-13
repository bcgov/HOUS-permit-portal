require "fileutils"
require "json"
require "open3"
require_relative "concerns/pdf_renderer"

class StepCodeReportGenerationJob
  include Sidekiq::Worker
  include PdfRenderer

  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    # lock by step code id
    [args[0]]
  end

  # Generates a step code report PDF without requiring a permit application or submission version
  # For now this is a scaffold that prepares JSON input for the SSR script; it does not invoke rendering yet.
  # Args:
  # - step_code_id: ID of the StepCode record
  # - options: hash with optional overrides like { "outputFilename" => "custom.pdf" }
  def perform(step_code_id, options = {})
    step_code = StepCode.find_by(id: step_code_id)
    return if step_code.blank?

    # Guard: Only generate standalone reports when there is no associated permit application
    return if step_code.permit_application_id.present?

    generation_directory_path = Rails.root.join("tmp/files")
    asset_directory_path = Rails.root.join("public")

    ensure_directory_exists(generation_directory_path)

    output_filename =
      options["outputFilename"].presence ||
        "step_code_report_#{step_code.id}.pdf"
    # Build checklist JSON using the checklist blueprint in extended view if available
    checklist_json =
      begin
        checklist = step_code.primary_checklist
        if checklist.present?
          step_code.checklist_blueprint.render_as_hash(
            checklist,
            view: :extended
          )
        else
          nil
        end
      rescue NotImplementedError
        nil
      end
    # Derive a permitTypeCode compatible with SSR ChecklistComponentMap
    permit_type_code =
      step_code.is_a?(Part9StepCode) ? "low_residential" : "medium_residential"
    pdf_json_data = {
      checklist: checklist_json && camelize_response(checklist_json),
      stepCode:
        camelize_response(
          {
            id: step_code.id,
            full_address: step_code.full_address,
            reference_number: step_code.reference_number,
            title: step_code.title,
            permit_date: step_code.permit_date,
            pid: step_code.pid,
            pin: step_code.pin,
            jurisdiction_name:
              (
                step_code.respond_to?(:jurisdiction_name) &&
                  step_code.jurisdiction_name
              )
          }.compact
        ),
      meta: {
        generationPaths: {
          stepCodeChecklist:
            generation_directory_path.join(output_filename).to_s
        },
        assetDirectoryPath: asset_directory_path.to_s,
        permitTypeCode: permit_type_code
      }
    }

    # Write JSON file for the SSR script (kept for the next implementation step)
    json_filename =
      write_json_to_tmp(
        generation_directory_path,
        "pdf_json_data_step_code_#{step_code.id}.json",
        pdf_json_data
      )

    # Invoke the Node SSR script to generate the PDF
    pdf_path = generation_directory_path.join(output_filename).to_s

    exit_status = run_node_pdf_renderer(json_filename)

    if exit_status.success?
      if File.exist?(pdf_path)
        # Ensure the association exists before attaching the file so uploader paths can include parent IDs
        report_doc = step_code.report_documents.build
        File.open(pdf_path) { |file| report_doc.file = file }
        report_doc.save!
        File.delete(pdf_path) if Rails.env.production?
      else
        Rails.logger.error(
          "StepCodeReportGenerationJob expected PDF not found at #{pdf_path} after successful render."
        )
      end
    else
      err = "StepCode report PDF generation failed: #{exit_status}"
      Rails.logger.error(err)
      raise err
    end
  end

  # camelize_response and helpers provided by PdfRenderer
end

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
    options = args[1]
    checklist_id =
      options.is_a?(Hash) ? options.stringify_keys["checklist_id"] : nil
    [args[0], checklist_id]
  end

  # Generates a Step Code report PDF without requiring a permit application or submission version
  # For now this is a scaffold that prepares JSON input for the SSR script; it does not invoke rendering yet.
  # Args:
  # - step_code_id: ID of the StepCode record
  # - options: hash with optional overrides like { "outputFilename" => "custom.pdf" }
  def perform(step_code_id, options = {})
    options = (options || {}).with_indifferent_access
    step_code = StepCode.find_by(id: step_code_id)
    return if step_code.blank?

    generation_directory_path = Rails.root.join("tmp/files")
    asset_directory_path = Rails.root.join("public")

    ensure_directory_exists(generation_directory_path)

    output_filename =
      options["outputFilename"].presence ||
        "step_code_report_#{step_code.id}.pdf"
    checklist =
      begin
        if options[:checklist_id].present?
          step_code.checklist_for(id: options[:checklist_id])
        elsif options[:stage].present?
          step_code.checklist_for(stage: options[:stage])
        else
          step_code.current_checklist
        end
      rescue NotImplementedError
        nil
      end
    checklist_json =
      if checklist.present?
        step_code.checklist_blueprint.render_as_hash(checklist, view: :extended)
      end

    # Guard: SSR requires checklist data; skip generation if checklist is absent
    if checklist_json.blank?
      Rails.logger.info(
        "Skipping StepCodeReportGenerationJob for #{step_code.id}: checklist not present for standalone StepCode."
      )
      return
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
            type: step_code.class.name,
            full_address: step_code.full_address,
            reference_number: step_code.reference_number,
            title: step_code.title,
            phase: step_code.phase,
            current_stage: step_code.current_stage,
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
    # Remove any existing file to avoid reusing a stale PDF if rendering fails
    FileUtils.rm_f(pdf_path)

    exit_status = run_node_pdf_renderer(json_filename)

    if exit_status.success?
      if File.exist?(pdf_path)
        report_doc = find_or_build_report_document(step_code, checklist)
        File.open(pdf_path) { |file| report_doc.file = file }
        report_doc.stale = false
        report_doc.save!

        # Notify relevant users that report is ready for download
        NotificationService.publish_step_code_report_generated_event(report_doc)
        File.delete(pdf_path) if Rails.env.production?
      else
        Rails.logger.error(
          "StepCodeReportGenerationJob expected PDF not found at #{pdf_path} after successful render."
        )
      end
    else
      # Ensure no failed or partial PDF remains in production
      FileUtils.rm_f(pdf_path) if Rails.env.production?
      err = "StepCode report PDF generation failed: #{exit_status}"
      Rails.logger.error(err)
      raise err
    end
  end

  private

  def find_or_build_report_document(step_code, checklist)
    report_doc =
      checklist.report_document ||
        checklist.build_report_document(step_code: step_code)
    report_doc.step_code = step_code
    report_doc
  end

  # camelize_response and helpers provided by PdfRenderer
end

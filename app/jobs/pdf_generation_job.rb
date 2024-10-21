require "open3"
require "json"
require "fileutils"

class PdfGenerationJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_and_while_executing,
                  queue: :file_processing,
                  on_conflict: {
                    client: :log,
                    server: :reject
                  }

  def self.lock_args(args)
    ## only lock on the first argument, which is the permit application id
    ## this will prevent multiple jobs from running for the same permit application
    [args[0]]
  end

  def perform(permit_application_id)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?

    generation_directory_path = Rails.root.join("tmp/files")
    asset_directory_path = Rails.root.join("public")

    # Check if the directory exists, and if not, create it
    unless File.directory?(generation_directory_path)
      FileUtils.mkdir_p(generation_directory_path)
      puts "Directory created: #{generation_directory_path}"
    end

    submission_version_with_missing_pdfs =
      permit_application.submission_versions.select(&:missing_pdfs?)

    submission_versions_data =
      submission_version_with_missing_pdfs.map do |submission_version|
        # Convert data to JSON string
        application_filename =
          "permit_application_#{permit_application.id}_v#{submission_version.version_number}.pdf"
        step_code_filename =
          "step_code_checklist_#{permit_application.id}_v#{submission_version.version_number}.pdf"

        should_permit_application_pdf_be_generated =
          submission_version.missing_permit_application_pdf?
        should_checklist_pdf_be_generated =
          submission_version.missing_step_code_checklist_pdf?

        pdf_json_data = {
          permitApplication:
            camelize_response(
              PermitApplicationBlueprint.render_as_json(
                permit_application,
                view: :pdf_generation,
                form_json: submission_version.form_json,
                submission_data: submission_version.formatted_submission_data,
                submitted_at: submission_version.created_at
              )
            ),
          checklist:
            submission_version.has_step_code_checklist? &&
              camelize_response(submission_version.step_code_checklist_json),
          meta: {
            generationPaths: {
              permitApplication:
                should_permit_application_pdf_be_generated &&
                  generation_directory_path.join(application_filename).to_s,
              stepCodeChecklist:
                should_checklist_pdf_be_generated &&
                  generation_directory_path.join(step_code_filename).to_s
            },
            assetDirectoryPath: asset_directory_path.to_s
          }
        }.to_json

        {
          submission_version: submission_version,
          pdf_json_data: pdf_json_data,
          application_filename: application_filename,
          step_code_filename: step_code_filename,
          should_permit_application_pdf_be_generated:
            should_permit_application_pdf_be_generated,
          should_checklist_pdf_be_generated: should_checklist_pdf_be_generated
        }
      end

    submission_versions_data.each do |submission_version_data|
      generate_pdfs(submission_version_data, generation_directory_path)
    end
  end

  def generate_pdfs(submission_version_data, generation_directory_path)
    submission_version = submission_version_data[:submission_version]
    pdf_json_data = submission_version_data[:pdf_json_data]
    application_filename = submission_version_data[:application_filename]
    step_code_filename = submission_version_data[:step_code_filename]
    should_permit_application_pdf_be_generated =
      submission_version_data[:should_permit_application_pdf_be_generated]
    should_checklist_pdf_be_generated =
      submission_version_data[:should_checklist_pdf_be_generated]

    json_filename =
      "#{generation_directory_path}/pdf_json_data_#{submission_version.id}.json"

    File.open(json_filename, "w") { |file| file.write(pdf_json_data) }

    # Run Node.js script as a child process, passing JSON data as an argument
    stdout, stderr, status =
      Open3.popen3(
        "npm",
        "run",
        NodeScripts::GENERATE_PDF_SCRIPT_NAME,
        json_filename,
        chdir: Rails.root.to_s
      ) do |stdin, stdout, stderr, wait_thr|
        # Read and print the standard output continuously until the process exits
        stdout.each_line { |line| puts line }

        stderr.each_line { |line| puts line }

        # Wait for the process to exit and get the exit status
        exit_status = wait_thr.value

        File.delete(json_filename)

        # Check for errors or handle output based on the exit status
        if exit_status.success?
          pdfs = []
          if should_permit_application_pdf_be_generated
            pdfs << {
              fname: application_filename,
              key: PermitApplication::PERMIT_APP_PDF_DATA_KEY
            }
          end
          if should_checklist_pdf_be_generated
            pdfs << {
              fname: step_code_filename,
              key: PermitApplication::CHECKLIST_PDF_DATA_KEY
            }
          end

          pdfs.each do |pdf|
            path = "#{generation_directory_path}/#{pdf[:fname]}"
            file = File.open(path)
            doc =
              submission_version
                .supporting_documents
                .where(
                  permit_application_id:
                    submission_version.permit_application_id,
                  data_key: pdf[:key]
                )
                .first_or_initialize

            doc.update(file:) if doc.file.blank?

            File.delete(path)
          end
        else
          err = "Pdf generation process failed: #{exit_status}"
          Rails.logger.error err

          # this will raise an error and retry the job
          raise err
        end
      end
  end

  SUBMISSION_DATA_PREFIX = "formSubmissionData"
  FORMIO_SECTION_REGEX =
    /^section[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  SECTION_COMPLETION = "section-completion-key"

  def camelize_response(data)
    camelize_hash(data)
  end

  def camelize_hash(obj)
    case obj
    when Hash
      obj.each_with_object({}) do |(k, v), result|
        camelized_key = camelize_key(k)
        result[camelized_key] = camelize_hash(v)
      end
    when Array
      obj.map { |v| camelize_hash(v) }
    else
      obj
    end
  end

  def camelize_key(key)
    if key == SECTION_COMPLETION || key.start_with?(SUBMISSION_DATA_PREFIX)
      return key
    end

    return key if key.match?(FORMIO_SECTION_REGEX)

    key
      .split("_")
      .map
      .with_index { |word, index| index.zero? ? word : word.capitalize }
      .join
  end
end

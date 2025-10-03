require "open3"
require "json"
require "fileutils"

class WebformToPdfJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    # only lock on the first argument, which is the pdf form id
    # this will prevent multiple jobs from running for the same pdf form
    [args[0]]
  end

  def perform(pdf_form_id)
    pdf_form = PdfForm.find(pdf_form_id)
    return if pdf_form.blank?

    generation_directory_path = Rails.root.join("tmp/files")
    asset_directory_path = Rails.root.join("public")

    # Check if the directory exists, and if not, create it
    unless File.directory?(generation_directory_path)
      FileUtils.mkdir_p(generation_directory_path)
      puts "Directory created: #{generation_directory_path}"
    end

    # Convert data to JSON string
    application_filename = "pdf_form_#{pdf_form.id}.pdf"

    pdf_json_data = {
      pdfForm:
        camelize_response(
          PdfFormBlueprint.render_as_json(pdf_form, view: :pdf_generation)
        ),
      meta: {
        generationPaths: {
          pdfForm: generation_directory_path.join(application_filename).to_s
        },
        assetDirectoryPath: asset_directory_path.to_s
      }
    }.to_json

    # Convert form_json to proper hash if it's in array format
    form_json_data =
      if pdf_form.form_json.is_a?(Array)
        Hash[*pdf_form.form_json.flatten(1)]
      else
        pdf_form.form_json
      end

    submission_versions_data = [
      {
        json_data: form_json_data,
        pdf_json_data: pdf_json_data,
        application_filename: application_filename
      }
    ]

    submission_versions_data.each do |data_with_pdf|
      generate_pdfs(data_with_pdf, generation_directory_path, pdf_form)
    end
  end

  def generate_pdfs(json_data_with_pdfs, generation_directory_path, pdf_form)
    json_data = json_data_with_pdfs[:json_data]
    pdf_json_data = json_data_with_pdfs[:pdf_json_data]
    application_filename = json_data_with_pdfs[:application_filename]

    json_filename =
      "#{generation_directory_path}/pdf_json_data_#{SecureRandom.hex(8)}.json"

    File.open(json_filename, "w") { |file| file.write(pdf_json_data) }

    stdout_lines = []
    stderr_lines = []

    stdout, stderr, status =
      Open3.popen3(
        "npm",
        "run",
        NodeScripts::GENERATE_PDF_SCRIPT_NAME,
        json_filename,
        chdir: Rails.root.to_s
      ) do |stdin, stdout, stderr, wait_thr|
        # Read and collect the standard output and stderr
        stdout.each_line do |line|
          puts line
          stdout_lines << line.chomp
        end

        stderr.each_line do |line|
          puts line
          stderr_lines << line.chomp
        end

        # Wait for the process to exit and get the exit status
        exit_status = wait_thr.value

        #File.delete(json_filename) if Rails.env.production?
        File.delete(json_filename)

        # Check for errors or handle output based on the exit status
        if exit_status.success?
          pdfs = []
          pdfs << {
            fname: application_filename,
            key: PdfForm::PDF_FORM_PDF_DATA_KEY
          }

          pdfs.each do |pdf|
            path = "#{generation_directory_path}/#{pdf[:fname]}"
            file = File.open(path)
            # doc =
            #   PdfForm
            #     .where(
            #       data_key: pdf[:key]
            #     )
            #     .first_or_initialize

            # doc.update(file:) if doc.file.blank?

            # File.delete(path) if Rails.env.production? # Keep PDF files for download
          end
        else
          error_details = []
          error_details << "Exit status: #{exit_status}"
          if stdout_lines.any?
            error_details << "STDOUT: #{stdout_lines.join("\n")}"
          end
          if stderr_lines.any?
            error_details << "STDERR: #{stderr_lines.join("\n")}"
          end

          err = "Pdf generation process failed:\n#{error_details.join("\n")}"
          Rails.logger.error err

          # this will raise an error and retry the job
          raise err
        end
      end
  end

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
    key
      .split("_")
      .map
      .with_index { |word, index| index.zero? ? word : word.capitalize }
      .join
  end
end

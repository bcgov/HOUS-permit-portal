require "open3"
require "json"
require "fileutils"

class PdfGenerationJob
  include Sidekiq::Worker

  def perform(permit_application_id)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?

    generation_directory_path = Rails.root.join("generated_pdfs")

    # Check if the directory exists, and if not, create it
    unless File.directory?(generation_directory_path)
      FileUtils.mkdir_p(generation_directory_path)
      puts "Directory created: #{generation_directory_path}"
    end

    # Convert data to JSON string
    pdf_json_data = {
      permitApplication:
        camelize_response(PermitApplicationBlueprint.render_as_json(permit_application, view: :extended)),
      meta: {
        generationPath: generation_directory_path.join("my_pdf.pdf").to_s,
      },
    }.to_json

    # Run Node.js script as a child process, passing JSON data as an argument
    # Rails.logger.info NodeScripts::NODE_SCRIPTS_DIR
    stdout, stderr, status =
      Open3.popen3(
        "npm",
        "run",
        NodeScripts::GENERATE_PDF_SCRIPT_NAME,
        pdf_json_data,
        chdir: Rails.root.to_s,
      ) do |stdin, stdout, stderr, wait_thr|
        # Read and print the standard output continuously until the process exits
        stdout.each_line { |line| puts line }

        stderr.each_line { |line| puts line }

        # Wait for the process to exit and get the exit status
        exit_status = wait_thr.value

        # Check for errors or handle output based on the exit status
        if exit_status.success?
          puts "Pdf generation process succeeded"
        else
          puts "Pdf generation process failed"
        end
      end

    # # Check for errors or handle output
    # if status.success?
    #   Rails.logger.info "Pdf generation process succeeded: #{stdout}"
    #   true
    # else
    #   Rails.logger.error "Pdf generation process failed: #{stderr}"
    #   false
    # end
  end

  SUBMISSION_DATA_PREFIX = "formSubmissionData"
  FORMIO_SECTION_REGEX = /^section[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
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
    return key if key == SECTION_COMPLETION || key.start_with?(SUBMISSION_DATA_PREFIX)

    return key if key.match?(FORMIO_SECTION_REGEX)

    key.split("_").map.with_index { |word, index| index.zero? ? word : word.capitalize }.join
  end
end

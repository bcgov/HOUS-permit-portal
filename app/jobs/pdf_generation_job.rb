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
      permitApplication: PermitApplicationBlueprint.render(permit_application, view: :extended),
      meta: {
        generationPath: generation_directory_path.join("my_pdf.pdf").to_s,
      },
    }.to_json

    # Run Node.js script as a child process, passing JSON data as an argument
    # Rails.logger.info NodeScripts::NODE_SCRIPTS_DIR
    stdout, stderr, status =
      Open3.capture3(
        "npm",
        "run",
        NodeScripts::GENERATE_PDF_SCRIPT_NAME,
        pdf_json_data,
        chdir: NodeScripts::NODE_SCRIPTS_DIR,
      )

    # Check for errors or handle output
    if status.success?
      Rails.logger.info "Pdf generation process succeeded: #{stdout}"
      true
    else
      Rails.logger.error "Pdf generation process failed: #{stderr}"
      false
    end
  end
end

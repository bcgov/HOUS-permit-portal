require "open3"
require "json"
require "fileutils"

class PdfGenerationJob
  include Sidekiq::Worker

  include Sidekiq::Worker

  def perform()
    generation_directory_path = Rails.root.join("generated_pdfs")

    # Check if the directory exists, and if not, create it
    unless File.directory?(generation_directory_path)
      FileUtils.mkdir_p(generation_directory_path)
      puts "Directory created: #{generation_directory_path}"
    end

    # Convert data to JSON string
    pdf_json_data = {
      document: {
        title: "My PDF",
        content: "Hello, World!",
      },
      meta: {
        generationPath: generation_directory_path.join("my_pdf.pdf").to_s,
      },
    }.to_json

    # Run Node.js script as a child process, passing JSON data as an argument
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
      puts "Node generate_pdf_script.js process succeeded: #{stdout}"
    else
      puts "Node generate_pdf_script.js process failed: #{stderr}"
    end
  end
end

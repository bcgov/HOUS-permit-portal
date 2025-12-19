require "open3"
require "json"
require "fileutils"

class OverheatingReportGenerationJob
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
      # [OVERHEATING REVIEW] Mini-lesson: jobs should log via `Rails.logger` not `puts`.
      # `puts` may not show up where you expect (and can be noisy); `Rails.logger` is structured.
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
        # [OVERHEATING REVIEW] Mini-lesson: understand your data shape (don’t “guess until it works”).
        # This kind of “maybe it’s an Array, maybe it’s a Hash” code is often AI slop: it papers over
        # the real question (what does `form_json` *actually* contain?).
        #
        # In this codebase, having a clear, stable contract (and giving a smart AI model a concrete example
        # of the real payload) goes a long way—prefer making `form_json` consistently a Hash at the source.
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

  def store_pdf(pdf_form, path, application_filename)
    return unless File.exist?(path) && File.size(path).positive?

    # [OVERHEATING REVIEW] Mini-lesson: what actually “uploads” to S3 here?
    # `include FileUploader.Attachment(:pdf_file)` wires PdfForm into Shrine.
    # When you do `pdf_form.update!(pdf_file: file)` it updates `pdf_file_data` and triggers Shrine’s
    # promotion/upload pipeline (similar to how `PdfGenerationJob` does `doc.update(file:)` for SupportingDocument).
    # That’s the “magic” you want—so don’t bypass it with manual S3 calls.
    #
    # Note: `application_filename` is unused; either remove it or use it as part of metadata/notifications.
    File.open(path, "rb") { |file| pdf_form.update!(pdf_file: file) }
  ensure
    # [OVERHEATING REVIEW] Good instinct cleaning up tmp files. Consider also removing
    # stale/partial PDFs before generation (see PdfGenerationJob) so you never upload old output.
    FileUtils.rm_f(path)
  end

  def generate_pdfs(json_data_with_pdfs, generation_directory_path, pdf_form)
    pdf_json_data = json_data_with_pdfs[:pdf_json_data]
    application_filename = json_data_with_pdfs[:application_filename]
    json_filename =
      "#{generation_directory_path}/pdf_json_data_#{SecureRandom.hex(8)}.json"

    # [OVERHEATING REVIEW] Mini-lesson: avoid copy/pasting infra helpers.
    # This job duplicates logic from `PdfGenerationJob` and `PdfRenderer` (write temp JSON, run node renderer, cleanup).
    # Prefer using the shared concern (`app/jobs/concerns/pdf_renderer.rb`) so behavior stays consistent.
    File.open(json_filename, "w") { |file| file.write(pdf_json_data) }

    stdout_lines = []
    stderr_lines = []

    Open3.popen3(
      "npm",
      "run",
      NodeScripts::GENERATE_PDF_SCRIPT_NAME,
      json_filename,
      chdir: Rails.root.to_s
    ) do |stdin, stdout, stderr, wait_thr|
      stdout.each_line do |line|
        # [OVERHEATING REVIEW] Prefer `Rails.logger.info(line)` so Sidekiq logs are consistent
        # and can be filtered. Also consider redacting large JSON if it ever appears here.
        puts line
        stdout_lines << line.chomp
      end

      stderr.each_line do |line|
        # [OVERHEATING REVIEW] Same logging note: use Rails.logger.error for stderr.
        puts line
        stderr_lines << line.chomp
      end

      exit_status = wait_thr.value

      File.delete(json_filename) if Rails.env.production?

      if exit_status.success?
        path = "#{generation_directory_path}/#{application_filename}"
        store_pdf(pdf_form, path, application_filename)
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

        # [OVERHEATING REVIEW] Mini-lesson: retries + failure modes.
        # Raising here will retry the job, which is good, but consider also recording failure state on PdfForm
        # so the UI can show a helpful message without hunting Sidekiq logs.
        raise err
      end
    end
  ensure
    if Rails.env.production? && json_filename && File.exist?(json_filename)
      File.delete(json_filename)
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

require "open3"
require "json"
require "fileutils"

module PdfRenderer
  # Ensures the given directory exists
  def ensure_directory_exists(directory_path)
    FileUtils.mkdir_p(directory_path) unless File.directory?(directory_path)
  end

  # Writes a JSON payload to a temp file in the given directory, returns the full file path
  def write_json_to_tmp(directory_path, basename, json_payload)
    ensure_directory_exists(directory_path)
    filename = File.join(directory_path.to_s, basename)
    File.open(filename, "w") { |file| file.write(JSON.generate(json_payload)) }
    filename
  end

  # Runs the Node SSR PDF renderer with the provided JSON file path.
  # Streams logs and returns the exit status object.
  def run_node_pdf_renderer(json_filename)
    Open3.popen3(
      "npm",
      "run",
      NodeScripts::GENERATE_PDF_SCRIPT_NAME,
      json_filename,
      chdir: Rails.root.to_s
    ) do |_stdin, stdout, stderr, wait_thr|
      stdout.each_line { |line| Rails.logger.info(line) }
      stderr.each_line { |line| Rails.logger.error(line) }

      exit_status = wait_thr.value
      File.delete(json_filename) if Rails.env.production?
      exit_status
    end
  end

  # Basic camelize helpers; jobs with special rules can override camelize_key
  def camelize_response(data)
    camelize_hash(data)
  end

  def camelize_hash(obj)
    case obj
    when Hash
      obj.each_with_object({}) do |(k, v), result|
        result[camelize_key(k)] = camelize_hash(v)
      end
    when Array
      obj.map { |v| camelize_hash(v) }
    else
      obj
    end
  end

  def camelize_key(key)
    key
      .to_s
      .split("_")
      .map
      .with_index { |word, index| index.zero? ? word : word.capitalize }
      .join
  end
end

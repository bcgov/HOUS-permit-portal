require "open-uri"
require "zip"
require "fileutils"
require "tmpdir"

class SupportingDocumentsZipper
  attr_reader :permit_application, :temp_files, :file_path, :document_ids

  def initialize(
    permit_application_id,
    document_ids: nil,
    submission_version: nil,
    version_ids: nil
  )
    @permit_application = PermitApplication.find(permit_application_id)
    @document_ids = Array(document_ids).presence
    @submission_version =
      submission_version || @permit_application.latest_submission_version
    @version_ids = version_ids
    @temp_files = []
    # Ensure tmp/zipfiles directory exists
    zipfiles_directory = Rails.root.join("tmp", "zipfiles")
    unless File.directory?(zipfiles_directory)
      FileUtils.mkdir_p(zipfiles_directory)
    end
    zip_filename =
      PermitApplicationGeneratedFileNamer.new(
        @permit_application
      ).supporting_documents_zip
    @directory = Dir.mktmpdir("package-", zipfiles_directory.to_s)
    @file_path = Pathname.new(@directory).join(zip_filename)
    @documents = select_documents.to_a
    if @document_ids && (@document_ids - @documents.map(&:id)).any?
      raise "Requested ZIP documents are unavailable"
    end
  rescue StandardError
    if @directory && File.directory?(@directory)
      FileUtils.remove_entry(@directory)
    end
    raise
  end

  def perform
    create_zip_file
    upload_zip_file
  ensure
    cleanup_temp_files
  end

  # Builds a zip without uploading. Yields the path; cleans up afterward.
  def with_zip
    create_zip_file
    yield file_path
  ensure
    cleanup_temp_files
  end

  private

  def create_zip_file
    # Pre-remove any existing zip to avoid reusing stale/partial files
    FileUtils.rm_f(file_path)
    used_entry_names = Hash.new(0)

    Zip::File.open(file_path, Zip::File::CREATE) do |zipfile|
      @documents.each do |document|
        file_path = download_file(document)
        raise "Required ZIP member could not be downloaded" unless file_path
        if file_path
          zipfile.add(
            unique_zip_entry_name(document, used_entry_names),
            file_path
          )
        end
      end
    end
  end

  def select_documents
    docs =
      permit_application.all_submission_version_completed_supporting_documents
    if @version_ids
      versions = permit_application.submission_versions.where(id: @version_ids)
      upload_ids =
        versions.flat_map do |version|
          collect_upload_ids(version.submission_data)
        end
      if (upload_ids.uniq - docs.map(&:id)).any?
        raise "Required supporting documents are unavailable"
      end
      docs =
        docs.select do |doc|
          upload_ids.include?(doc.id) ||
            (
              @version_ids.include?(doc.submission_version_id) &&
                SupportingDocument::STATIC_DOCUMENT_DATA_KEYS.include?(
                  doc.data_key
                )
            )
        end
    end
    return docs if document_ids.blank?

    docs.select { |document| document_ids.include?(document.id) }
  end

  def unique_zip_entry_name(document, used_entry_names)
    filename = File.basename(document.download_filename.presence || "download")
    basename = File.basename(filename, ".*")
    extension = File.extname(filename)
    candidate = filename
    suffix = 1

    while used_entry_names[candidate].positive?
      suffix += 1
      candidate = "#{basename} (#{suffix})#{extension}"
    end

    used_entry_names[candidate] += 1

    candidate
  end

  def upload_zip_file
    submission_version = @submission_version
    unless submission_version
      raise "Failed to upload zip file: no submission version"
    end

    File.open(file_path.to_s, "rb") do |file|
      uploader = ZipfileUploader.new(:store)
      temp_files << file.path
      uploaded_file = uploader.upload(file)
      if @version_ids && !uploaded_file.exists?
        raise "Uploaded ZIP is unavailable"
      end
      submission_version.zipfile_data = uploaded_file.data

      raise "Failed to save ZIP attachment" unless submission_version.save
    end
  end

  def download_file(document)
    if @version_ids
      PrintReports::Generation.new.promote!(document)
      downloaded = document.file.download
      temp_files << downloaded
      if document.file_size && downloaded.size != document.file_size
        raise "ZIP member size mismatch"
      end
      return downloaded.path
    end
    document.save unless document.id.present?
    temp_file = Tempfile.new(["download", File.extname(document.id)])
    temp_file.binmode
    url = URI.parse(document.file_url)
    Net::HTTP.start(
      url.host,
      url.port,
      use_ssl: url.scheme == "https",
      open_timeout: 5,
      read_timeout: 60
    ) do |http|
      request = Net::HTTP::Get.new(url)
      http.request(request) do |response|
        unless response.is_a?(Net::HTTPSuccess)
          raise "ZIP member download failed (HTTP #{response.code})"
        end
        response.read_body { |chunk| temp_file.write(chunk) }
      end
    end
    temp_file.close
    temp_files << temp_file
    temp_file.path
  rescue => e
    Rails.logger.error(
      "Failed to download ZIP member #{document.id}: #{e.class}"
    )
    temp_file&.close
    temp_file&.unlink
    raise
  end

  def cleanup_temp_files
    temp_files.each do |file|
      if file.is_a?(Tempfile)
        file.close unless file.closed?
        file.unlink
      else
        FileUtils.rm_f(file)
      end
    end
    FileUtils.rm_f(file_path)
    if @directory && File.directory?(@directory)
      FileUtils.remove_entry(@directory)
    end
  end

  def collect_upload_ids(value)
    case value
    when Hash
      [value["model_id"], value["modelId"]].compact +
        value.values.flat_map { |v| collect_upload_ids(v) }
    when Array
      value.flat_map { |v| collect_upload_ids(v) }
    else
      []
    end
  end
end

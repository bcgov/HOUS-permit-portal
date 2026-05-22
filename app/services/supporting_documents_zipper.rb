require "open-uri"
require "zip"
require "fileutils"

class SupportingDocumentsZipper
  attr_reader :permit_application, :temp_files, :file_path

  def initialize(permit_application_id)
    @permit_application = PermitApplication.find(permit_application_id)
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
    @file_path = zipfiles_directory.join(zip_filename)
  end

  def perform
    create_zip_file
    upload_zip_file
  ensure
    cleanup_temp_files
  end

  private

  def create_zip_file
    # Pre-remove any existing zip to avoid reusing stale/partial files
    FileUtils.rm_f(file_path)
    used_entry_names = Hash.new(0)

    Zip::File.open(file_path, Zip::File::CREATE) do |zipfile|
      permit_application
        .all_submission_version_completed_supporting_documents
        .each do |document|
        file_path = download_file(document)
        if file_path
          zipfile.add(
            unique_zip_entry_name(document, used_entry_names),
            file_path
          )
        end
      end
    end
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
    File.open(file_path.to_s, "rb") do |file|
      uploader = ZipfileUploader.new(:store)
      temp_files << file.path
      uploaded_file = uploader.upload(file)
      permit_application.zipfile_data = uploaded_file.data

      unless permit_application.save
        Rails.logger.error "Failed to upload zip file: #{permit_application.errors.full_messages.join(", ")}"
      end
    end
  end

  def download_file(document)
    document.save unless document.id.present?
    temp_file = Tempfile.new(["download", File.extname(document.id)])
    temp_file.binmode
    url = URI.parse(document.file_url)
    Net::HTTP.start(
      url.host,
      url.port,
      use_ssl: url.scheme == "https"
    ) do |http|
      request = Net::HTTP::Get.new(url)
      http.request(request) do |response|
        response.read_body { |chunk| temp_file.write(chunk) }
      end
    end
    temp_file.close
    temp_files << temp_file
    temp_file.path
  rescue => e
    Rails.logger.error(
      "Failed to download file: #{document.file_url} with error: #{e.message}"
    )
    temp_file&.close
    temp_file&.unlink
    nil
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
  end
end

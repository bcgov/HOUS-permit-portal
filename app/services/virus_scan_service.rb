# frozen_string_literal: true

require "tempfile"

# Service for scanning files for viruses using ClamAV daemon over TCP.
#
# This service downloads files from Shrine storage (typically S3 cache) and
# streams them to a ClamAV daemon for virus scanning.
#
# @example Basic usage
#   scanner = VirusScanService.new(shrine_uploaded_file)
#   scanner.scan! # Raises InfectedFileError if virus detected
#
# @example Checking if safe
#   scanner = VirusScanService.new(shrine_uploaded_file)
#   if scanner.safe?
#     # proceed with file
#   else
#     # handle infected file
#   end
#
class VirusScanService
  # Raised when a virus is detected in the scanned file
  class InfectedFileError < StandardError
    attr_reader :virus_name, :file_id

    def initialize(message, virus_name: nil, file_id: nil)
      @virus_name = virus_name
      @file_id = file_id
      super(message)
    end
  end

  # Raised when there's an error connecting to or communicating with ClamAV
  class ScanError < StandardError
  end

  # Raised when ClamAV scanning is not enabled
  class NotEnabledError < StandardError
  end

  attr_reader :shrine_file

  # @param shrine_file [Shrine::UploadedFile] The Shrine uploaded file to scan
  def initialize(shrine_file)
    @shrine_file = shrine_file
  end

  # Scans the file and raises an error if a virus is detected.
  #
  # @raise [InfectedFileError] if a virus is detected
  # @raise [ScanError] if there's an error during scanning
  # @raise [NotEnabledError] if ClamAV is not enabled
  # @return [true] if the file is clean
  def scan!
    raise NotEnabledError, "ClamAV scanning is not enabled" unless enabled?

    result = perform_scan

    if result[:infected]
      Rails.logger.warn(
        "[VirusScanService] Virus detected: #{result[:virus_name]} in file: #{shrine_file.id}"
      )
      raise InfectedFileError.new(
              "Virus detected: #{result[:virus_name]}",
              virus_name: result[:virus_name],
              file_id: shrine_file.id
            )
    end

    Rails.logger.info("[VirusScanService] File clean: #{shrine_file.id}")
    true
  end

  # Checks if the file is safe (no virus detected).
  #
  # @return [Boolean] true if safe, false if infected or error occurred
  def safe?
    scan!
    true
  rescue InfectedFileError
    false
  rescue ScanError => e
    Rails.logger.error("[VirusScanService] Scan error: #{e.message}")
    # In case of scan errors, we default to unsafe to be cautious
    false
  end

  # Checks if ClamAV scanning is enabled.
  #
  # @return [Boolean]
  def enabled?
    ::CLAMAV_ENABLED
  end

  private

  def perform_scan
    temp_file = download_to_temp

    begin
      scan_with_clamav(temp_file)
    ensure
      cleanup_temp_file(temp_file)
    end
  rescue Errno::ECONNREFUSED, Errno::ETIMEDOUT, Errno::EHOSTUNREACH => e
    raise ScanError, "Cannot connect to ClamAV daemon: #{e.message}"
  rescue IOError, SocketError => e
    raise ScanError, "Communication error with ClamAV: #{e.message}"
  end

  def download_to_temp
    extension = File.extname(shrine_file.id).presence || ".bin"
    temp_file = Tempfile.new(["virus_scan", extension])
    temp_file.binmode

    # Shrine's `open` yields an IO object we can stream from
    shrine_file.open { |io| IO.copy_stream(io, temp_file) }

    temp_file.rewind
    temp_file
  rescue => e
    temp_file&.close
    temp_file&.unlink
    raise ScanError, "Failed to download file for scanning: #{e.message}"
  end

  def scan_with_clamav(temp_file)
    client = build_clamav_client

    # Use INSTREAM command to stream file content to ClamAV
    # This avoids needing the file to be on the ClamAV server's filesystem
    response = client.execute(ClamAV::Commands::InstreamCommand.new(temp_file))

    parse_scan_response(response)
  end

  def build_clamav_client
    # Create TCP socket connection to ClamAV daemon
    socket = TCPSocket.new(::CLAMAV_CONFIG[:host], ::CLAMAV_CONFIG[:port])

    # Build connection with the TCP socket
    connection =
      ClamAV::Connection.new(
        socket: socket,
        wrapper: ClamAV::Wrappers::NewLineWrapper.new
      )

    # Create client with the TCP connection
    ClamAV::Client.new(connection)
  end

  def parse_scan_response(response)
    # clamav-client gem returns response objects:
    # - ClamAV::SuccessResponse for clean files
    # - ClamAV::VirusResponse for infected files
    # - ClamAV::ErrorResponse for errors

    case response
    when ClamAV::SuccessResponse
      { infected: false, virus_name: nil }
    when ClamAV::VirusResponse
      { infected: true, virus_name: response.virus_name }
    when ClamAV::ErrorResponse
      raise ScanError, "ClamAV error: #{response.error_str}"
    else
      # Fallback to string parsing for unexpected response types
      parse_string_response(response.to_s)
    end
  end

  def parse_string_response(response_text)
    response_text = response_text.strip

    if response_text.include?("FOUND")
      virus_name = response_text.gsub(/^stream:\s*/, "").gsub(/\s*FOUND$/, "")
      { infected: true, virus_name: virus_name }
    elsif response_text.include?("OK")
      { infected: false, virus_name: nil }
    elsif response_text.include?("ERROR")
      error_msg = response_text.gsub(/^stream:\s*/, "").gsub(/\s*ERROR$/, "")
      raise ScanError, "ClamAV error: #{error_msg}"
    else
      raise ScanError, "Unexpected ClamAV response: #{response_text}"
    end
  end

  def cleanup_temp_file(temp_file)
    return unless temp_file

    temp_file.close unless temp_file.closed?
    temp_file.unlink if File.exist?(temp_file.path)
  rescue => e
    Rails.logger.warn(
      "[VirusScanService] Failed to cleanup temp file: #{e.message}"
    )
  end
end

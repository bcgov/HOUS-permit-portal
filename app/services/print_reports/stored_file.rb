require "pdf/reader"
require "zip"

module PrintReports
  class StoredFile
    # Only definite absence or invalid content permits replacement. Storage
    # authentication/network exceptions must propagate without deleting anything.
    def self.valid_pdf?(file)
      return false unless file && file.exists?
      # S3 opens a stream without a path; download supplies a Tempfile and
      # removes it when the block exits, including on validation failure.
      file.download do |download|
        return false unless File.binread(download.path, 5) == "%PDF-"
        reader = PDF::Reader.new(download.path)
        return false if reader.page_count.zero?
        reader.pages.each(&:text)
      end
      true
    rescue PDF::Reader::MalformedPDFError, PDF::Reader::UnsupportedFeatureError
      false
    end

    def self.valid_zip?(file)
      return false unless file && file.exists?
      file.download do |download|
        Zip::File.open(download.path) do |zip|
          return false if zip.entries.empty?
          zip.each do |entry|
            crc = 0
            size = 0
            entry.get_input_stream do |stream|
              while (bytes = stream.read(64 * 1024)) && !bytes.empty?
                crc = Zlib.crc32(bytes, crc)
                size += bytes.bytesize
              end
            end
            return false unless size == entry.size && crc == entry.crc
          end
        end
      end
      true
    rescue Zip::Error, Zlib::Error
      false
    end
  end
end

require "faraday/multipart"
require "pdf/reader"
require "tmpdir"

module PrintReports
  class Renderer
    class Error < StandardError
    end

    # Caller consumes the validated file within this block. No payloads are logged.
    def render(report, filename: "report.pdf")
      bundle = Rails.root.join("public/vite-print")
      unless %w[report.js print.css manifest.json].all? { |name|
               bundle.join(name).file?
             }
        raise Error,
              "Report assets missing: run npm run build:print (or npm run dev:print)"
      end
      if JSON.parse(bundle.join("manifest.json").read)["sourceDigest"] !=
           self.class.source_digest
        raise Error,
              "Report assets are stale: run npm run build:print (or npm run dev:print)"
      end
      digest = Digest::SHA256.hexdigest(JSON.generate(report))
      Dir.mktmpdir("bph-report-") do |dir|
        assets = {
          "report.js" => bundle.join("report.js"),
          "print.css" => bundle.join("print.css"),
          "logo.png" => Rails.root.join("public/images/logo.png"),
          "regular.ttf" =>
            Rails.root.join("public/fonts/2023_01_01_BCSans-Regular_2f.ttf"),
          "bold.ttf" =>
            Rails.root.join("public/fonts/2023_01_01_BCSans-Bold_2f.ttf")
        }
        File.write(File.join(dir, "index.html"), html(report, digest))
        assets["index.html"] = File.join(dir, "index.html")
        handles = []
        begin
          files =
            assets.map do |name, path|
              io = File.open(path, "rb")
              handles << io
              Faraday::Multipart::FilePart.new(
                io,
                "application/octet-stream",
                name
              )
            end
          response =
            connection.post(
              "/forms/chromium/convert/html",
              {
                files: files,
                waitForExpression:
                  "document.documentElement.dataset.reportDigest === '#{digest}' && document.documentElement.dataset.reportState === 'ready' && document.querySelector('#print-ready') !== null",
                emulatedMediaType: "print",
                preferCssPageSize: "true",
                paperWidth: "8.5",
                paperHeight: "11",
                scale: "1",
                marginTop: "0",
                marginBottom: "0",
                marginLeft: "0",
                marginRight: "0",
                printBackground: "true",
                failOnConsoleExceptions: "true",
                failOnResourceHttpStatusCodes: "[499,599]",
                failOnResourceLoadingFailed: "true"
              }
            )
          unless response.success?
            raise Error, "Gotenberg conversion failed (HTTP #{response.status})"
          end
          bytes = response.body
          if bytes.bytesize > 50 * 1024 * 1024
            raise Error, "PDF exceeds the 50 MiB output limit"
          end
          unless response.headers["content-type"].to_s.start_with?(
                   "application/pdf"
                 ) && bytes.start_with?("%PDF-")
            raise Error, "Gotenberg returned an invalid PDF response"
          end
          path = File.join(dir, File.basename(filename))
          File.binwrite(path, bytes)
          reader = PDF::Reader.new(path)
          if reader.page_count.zero?
            raise Error, "Gotenberg returned an empty PDF"
          end
          reader.pages.each(&:text) # Traverse objects before publishing, not just the header.
          Rails.logger.info(
            "PDF rendered kind=#{report[:kind]} digest=#{digest} pages=#{reader.page_count} bytes=#{bytes.bytesize}"
          )
          yield path
        ensure
          handles.each(&:close)
        end
      end
    rescue Faraday::Error,
           PDF::Reader::MalformedPDFError,
           PDF::Reader::UnsupportedFeatureError => e
      raise Error, "PDF conversion failed (#{e.class.name})"
    end

    def self.source_digest
      paths =
        Dir
          .glob(
            Rails.root.join("app/frontend/components/print/**/*.{ts,tsx,css}")
          )
          .reject { |p| p.include?("/__tests__/") }
      paths +=
        %w[
          app/frontend/i18n/i18n.ts
          app/frontend/styles/brand.ts
          vite.print.config.mjs
        ].map { |p| Rails.root.join(p).to_s }
      hash = Digest::SHA256.new
      paths.sort.each do |path|
        relative = Pathname.new(path).relative_path_from(Rails.root).to_s
        hash.update(relative + "\0").update(File.binread(path)).update("\0")
      end
      hash.hexdigest
    end

    private

    def connection
      Faraday.new(
        url: ENV.fetch("GOTENBERG_URL", "http://127.0.0.1:13000")
      ) do |f|
        f.request :multipart
        f.options.open_timeout = 5
        f.options.timeout = 75
        f.adapter Faraday.default_adapter
      end
    end

    def html(report, digest)
      payload = ERB::Util.json_escape(JSON.generate(report))
      <<~HTML
        <!doctype html><html lang="en" data-report-assets="packaged" data-report-digest="#{digest}">
        <head><meta charset="utf-8"><title>Building Permit Hub report</title>
        <link rel="stylesheet" href="print.css">
        <style>
          @font-face { font-family: "BC Sans"; src: url('regular.ttf'); font-weight: 400; }
          @font-face { font-family: "BC Sans"; src: url('bold.ttf'); font-weight: 700; }
        </style></head><body><div id="report-root"></div>
        <script id="report-data" type="application/json">#{payload}</script>
        <script src="report.js"></script></body></html>
      HTML
    end
  end
end

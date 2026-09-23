require "rails_helper"

RSpec.describe PrintReports::Renderer do
  let(:report) do
    {
      kind: "application",
      identity: {
        submission_version_id: "v1",
        exported_at: "2026-09-22"
      },
      form_json: {
        components: [
          { type: "textfield", key: "answer", label: "Original question" }
        ]
      },
      submission_data: {
        data: {
          answer: "Saved answer"
        }
      }
    }
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("GOTENBERG_URL", anything).and_return(
      "http://127.0.0.1:13000"
    )
  end

  context "transport and validation" do
    before do
      dir = @directory = Dir.mktmpdir
      %w[public/vite-print public/images public/fonts].each do |p|
        FileUtils.mkdir_p(File.join(dir, p))
      end
      %w[report.js report.css].each do |name|
        File.write(File.join(dir, "public/vite-print", name), "test")
      end
      File.write(File.join(dir, "public/images/logo.png"), "test")
      %w[
        2023_01_01_BCSans-Regular_2f.ttf
        2023_01_01_BCSans-Bold_2f.ttf
      ].each { |name| File.write(File.join(dir, "public/fonts", name), "test") }
      @original_root = Rails.root
      allow(Rails).to receive(:root).and_return(Pathname.new(dir))
      File.write(
        File.join(dir, "public/vite-print/manifest.json"),
        JSON.generate(sourceDigest: "test")
      )
      allow(described_class).to receive(:source_digest).and_return("test")
      @connection = instance_double(Faraday::Connection)
      allow_any_instance_of(described_class).to receive(:connection).and_return(
        @connection
      )
    end
    after { FileUtils.remove_entry(@directory) }

    def response(status, body = "", type = nil)
      instance_double(
        Faraday::Response,
        success?: status == 200,
        status: status,
        body: body,
        headers: {
          "content-type" => type
        }
      )
    end

    it "uploads a self-contained report with readiness and print settings, then cleans up" do
      pdf =
        File.binread(
          @original_root.join("spec/support/Test Document Seal - unsigned.pdf")
        )
      expect(@connection).to receive(:post).with(
        "/forms/chromium/convert/html",
        hash_including(
          waitForExpression: include("print-ready"),
          printBackground: "true",
          marginTop: "0"
        )
      ).and_return(response(200, pdf, "application/pdf"))
      output = nil
      described_class
        .new
        .render(report) do |path|
          output = path
          expect(PDF::Reader.new(path).page_count).to be > 0
        end
      expect(File.exist?(output)).to be false
    end

    it "rejects a successful HTTP response that is not a PDF" do
      allow(@connection).to receive(:post).and_return(
        response(200, "<html>Error</html>")
      )
      expect {
        described_class.new.render(report) { raise "must not publish" }
      }.to raise_error(described_class::Error, /invalid PDF/)
    end

    it "propagates renderer failure instead of publishing or falling back" do
      allow(@connection).to receive(:post).and_return(response(503))
      expect { described_class.new.render(report) {} }.to raise_error(
        described_class::Error,
        /503/
      )
    end

    it "requires built assets" do
      File.delete(Rails.root.join("public/vite-print/report.js"))
      expect { described_class.new.render(report) {} }.to raise_error(
        described_class::Error,
        /build:print/
      )
    end

    it "escapes closing script tags in saved answers" do
      report[:submission_data][:data][
        :answer
      ] = "</script><script>alert(1)</script>"
      html = described_class.new.send(:html, report, "digest")
      expect(html).not_to include("</script><script>alert")
      expect(html).to include("\\u003c/script")
    end
  end

  context "real local conversion", if: ENV["RUN_GOTENBERG_SPECS"] == "true" do
    around { |example| VCR.turned_off { example.run } }
    it "renders saved application values" do
      described_class
        .new
        .render(report) do |path|
          text = PDF::Reader.new(path).pages.map(&:text).join
          expect(text).to include("Saved answer", "Original question")
        end
    end

    it "preserves long answers, repeated rows, false and zero across pages" do
      report[:form_json][:components] += [
        { type: "textarea", key: "notes", label: "Long notes" },
        { type: "number", key: "zero", label: "Count" },
        { type: "checkbox", key: "false", label: "Confirmed" },
        {
          type: "datagrid",
          key: "rows",
          label: "Repeated answers",
          components: [{ type: "textfield", key: "name", label: "Name" }]
        }
      ]
      report[:submission_data][:data].merge!(
        notes: ("Long answer wraps across pages. " * 180) + "END-NOTES",
        zero: 0,
        false: false,
        rows: (1..60).map { |i| { name: "SAVED-ROW-#{i}-END" } }
      )
      described_class
        .new
        .render(report) do |path|
          reader = PDF::Reader.new(path)
          text = reader.pages.map(&:text).join
          expect(reader.page_count).to be > 3
          expect(text).to include("END-NOTES", "No", "0")
          (1..60).each { |i| expect(text).to include("SAVED-ROW-#{i}-END") }
        end
    end

    %w[part3 part9].each do |kind|
      it "renders the #{kind} report fixture" do
        fixture =
          JSON.parse(
            File.read(
              Rails.root.join(
                "app/frontend/components/print/__tests__/fixtures/#{kind}.json"
              )
            ),
            symbolize_names: true
          )
        described_class
          .new
          .render(fixture) do |path|
            text = PDF::Reader.new(path).pages.map(&:text).join
            expect(text).to include("QA-PART-#{kind.last}")
            expect(text).not_to include("could not be rendered")
          end
      end
    end
  end
end

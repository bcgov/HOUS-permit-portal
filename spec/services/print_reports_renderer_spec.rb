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
      %w[report.js print.css].each do |name|
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

    it "flattens layout wrappers without losing scopes, conditions or repeated answers" do
      field = ->(key, extra = {}) do
        { type: "textfield", key: key, label: key, input: true }.merge(extra)
      end
      report[:form_json] = {
        components: [
          {
            type: "container",
            key: "owner",
            title: "Owner details",
            components: [
              {
                type: "panel",
                title: "Owner details",
                components: [
                  {
                    type: "columns",
                    columns: [
                      { components: [field.call("first")] },
                      { components: [field.call("last")] }
                    ]
                  },
                  field.call("zero", type: "number"),
                  field.call("boolean", type: "checkbox"),
                  field.call("missing"),
                  field.call("hidden", customConditional: "show = false;"),
                  field.call(
                    "visible",
                    customConditional: "show = data.owner.first === 'Ada';"
                  ),
                  field.call(
                    "logicHidden",
                    logic: [
                      {
                        trigger: {
                          type: "javascript",
                          javascript: "result = true"
                        },
                        actions: [
                          {
                            type: "property",
                            property: {
                              type: "boolean",
                              value: "hidden"
                            },
                            state: true
                          }
                        ]
                      }
                    ]
                  ),
                  {
                    type: "datagrid",
                    key: "contacts",
                    label: "Contacts",
                    components: [field.call("first"), field.call("last")]
                  },
                  field.call("future", type: "futureType")
                ]
              }
            ]
          }
        ]
      }
      report[:submission_data] = {
        data: {
          owner: {
            first: "Ada",
            last: "Lovelace",
            zero: 0,
            boolean: false,
            hidden: "HIDDEN-ANSWER",
            logicHidden: "LOGIC-HIDDEN-ANSWER",
            visible: "VISIBLE-ANSWER",
            future: "FUTURE-ANSWER",
            contacts: [
              { first: "Grace", last: "Hopper" },
              { first: "Katherine", last: "Johnson" }
            ]
          }
        }
      }
      original = Marshal.dump(report)
      described_class
        .new
        .render(report) do |path|
          text = PDF::Reader.new(path).pages.map(&:text).join(" ")
          expect(text.scan("Owner details").length).to eq(1)
          %w[
            Ada
            Lovelace
            Grace
            Hopper
            Katherine
            Johnson
            VISIBLE-ANSWER
            FUTURE-ANSWER
          ].each { |value| expect(text).to include(value) }
          expect(text).to include("0", "No", "Not provided")
          expect(text).not_to include("HIDDEN-ANSWER", "LOGIC-HIDDEN-ANSWER")
        end
      expect(Marshal.dump(report)).to eq(original)
    end

    it "prints literal identifiers and accurate footers, omitting the cover footer" do
      report[:identity].merge!(
        number: 'QA-"quoted"-\\-<style>literal</style>',
        version_number: 2
      )
      described_class
        .new
        .render(report) do |path|
          reader = PDF::Reader.new(path)
          expect(reader.pages.first.text).not_to include("Page 1 of")
          reader
            .pages
            .drop(1)
            .each_with_index do |page, index|
              expect(page.text).to include(
                report[:identity][:number],
                "Version 2",
                "Page #{index + 2} of #{reader.page_count}"
              )
            end
        end
    end

    it "splits an oversized repeated record without losing its ending or following records" do
      report[:form_json] = {
        components: [
          {
            type: "datagrid",
            key: "records",
            label: "Detailed records",
            components: [
              { type: "textfield", key: "name", label: "Name", input: true },
              { type: "textarea", key: "notes", label: "Notes", input: true }
            ]
          }
        ]
      }
      report[:submission_data] = {
        data: {
          records: [
            {
              name: "FIRST-RECORD",
              notes:
                ("Long record narrative must remain readable. " * 250) +
                  "END-OVERSIZED-RECORD"
            },
            { name: "SECOND-RECORD", notes: "FOLLOWING-RECORD-ANSWER" }
          ]
        }
      }
      described_class
        .new
        .render(report) do |path|
          reader = PDF::Reader.new(path)
          text = reader.pages.map(&:text).join(" ")
          expect(reader.page_count).to be > 3
          expect(text).to include(
            "FIRST-RECORD",
            "END-OVERSIZED-RECORD",
            "SECOND-RECORD",
            "FOLLOWING-RECORD-ANSWER"
          )
          expect(text.index("END-OVERSIZED-RECORD")).to be <
            text.index("SECOND-RECORD")
        end
    end

    it "keeps distinct TEDI and MEUI values and results, including numeric zero" do
      fixture =
        JSON.parse(
          Rails
            .root
            .join(
              "app/frontend/components/print/__tests__/fixtures/part9-populated.json"
            )
            .read,
          symbolize_names: true
        )
      described_class
        .new
        .render(fixture) do |path|
          text = PDF::Reader.new(path).pages.map(&:text).join(" ")
          expect(text).to include(
            "50.50",
            "30.25",
            "35.00",
            "55.00",
            "Fail",
            "168.75",
            "0"
          )
        end
    end

    %w[
      part3-standard
      part3-baseline
      part3-mixed
      application-stress
    ].each do |name|
      it "retains the complete #{name} fixture and paginated identity" do
        fixture =
          JSON.parse(
            Rails
              .root
              .join(
                "app/frontend/components/print/__tests__/fixtures/#{name}.json"
              )
              .read,
            symbolize_names: true
          )
        described_class
          .new
          .render(fixture) do |path|
            reader = PDF::Reader.new(path)
            text = reader.pages.map(&:text).join(" ")
            expect(text).to include(fixture[:identity][:number])
            expect(text).not_to include("could not be rendered")
            reader
              .pages
              .drop(1)
              .each_with_index do |page, i|
                expect(page.text).to include(
                  "Page #{i + 2} of #{reader.page_count}"
                )
              end
            if name == "application-stress"
              expect(text).to include("END-NARRATIVE", "No")
              expect(reader.pages[1].text).to include("Narrative")
              (0..44).each { |i| expect(text).to include("ROW-#{i}") }
              expect(text.scan("Detailed contacts").length).to eq(1)
              expect(text.scan("Name").length).to be > 1 # Repeating table headers across pages.
            elsif name == "part3-baseline"
              expect(text).to include("54321.25", "43210.75")
            elsif name == "part3-mixed"
              expect(text).to include(
                "123.45",
                "100.25",
                "50.75",
                "45.50",
                "7.25"
              )
            end
          end
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

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
    it "prints only selected choice labels in schema order, including aliases and unknown saved values" do
      options = [
        {
          label:
            "Fireplace built into a prefabricated structure with a long description that wraps onto another line",
          value: "fireplace"
        },
        { label: "Pellet stove", value: "pellet" },
        { label: "UNSELECTED WOOD STOVE", value: "wood" }
      ]
      report[:form_json][:components] = [
        {
          type: "simplecheckboxes",
          key: "appliances",
          label: "Appliances",
          values: options
        },
        {
          type: "simpleselectadvanced",
          multiple: true,
          key: "multi",
          label: "Multiple selections",
          data: {
            values: options
          }
        },
        {
          type: "selectboxes",
          key: "empty",
          label: "Empty selection",
          values: options
        },
        {
          type: "select",
          key: "single",
          label: "Chimney",
          data: {
            values: [{ label: "Factory-built chimney", value: "factory" }]
          }
        },
        {
          type: "simpleradios",
          key: "radio",
          label: "Radio selection",
          values: [{ label: "Zero option", value: 0 }]
        },
        { type: "checkbox", key: "boolean", label: "Boolean answer" },
        { type: "number", key: "zero", label: "Numeric answer" },
        {
          type: "select",
          key: "missing",
          label: "Missing selection",
          input: true,
          values: options
        }
      ]
      report[:submission_data][:data] = {
        appliances: {
          :pellet => true,
          :wood => false,
          :fireplace => true,
          "LEGACY-CHOICE" => true
        },
        multi: %w[pellet fireplace],
        empty: {
          fireplace: false,
          pellet: false,
          wood: false
        },
        single: "factory",
        radio: 0,
        boolean: false,
        zero: 0
      }
      original = Marshal.dump(report)
      described_class
        .new
        .render(report) do |path|
          text =
            PDF::Reader.new(path).pages.map(&:text).join(" ").gsub(/\s+/, " ")
          expect(text).to include(
            options.first[:label],
            "Pellet stove",
            "LEGACY-CHOICE",
            "Factory-built chimney",
            "Zero option"
          )
          expect(text).not_to include("UNSELECTED WOOD STOVE")
          expect(text).to match(
            /Appliances.*Fireplace.*Pellet stove.*LEGACY-CHOICE/
          )
          expect(text).to match(/Multiple selections.*Fireplace.*Pellet stove/)
          expect(text).to match(/Empty selection\s+Not provided/)
          expect(text).to match(/Missing selection\s+Not provided/)
          expect(text).to match(/Boolean answer\s+Numeric answer\s+No\s+0/)
          expect(text.scan("✓").length).to eq(5)
        end
      expect(Marshal.dump(report)).to eq(original)
    end

    it "preserves the beginning and end of a multi-page answer with its question" do
      report[:form_json][:components] = [
        { type: "textarea", key: "answer", label: "Long answer question" }
      ]
      report[:submission_data][:data][:answer] = "BEGIN-ANSWER " +
        ("Long saved narrative. " * 1200) + " END-ANSWER"
      described_class
        .new
        .render(report) do |path|
          pages = PDF::Reader.new(path).pages
          expect(pages.length).to be > 3
          first_answer_page =
            pages.find { |page| page.text.include?("BEGIN-ANSWER") }
          expect(first_answer_page.text).to include("Long answer question")
          expect(pages.map(&:text).join(" ")).to include("END-ANSWER")
        end
    end

    it "prints cover metadata and falls back to the template when there are no tags" do
      report[:identity].merge!(
        address: "42 Current Avenue",
        jurisdiction: "Example Municipality",
        applicant: "Alex Applicant",
        number: "APP-042",
        version_number: 2,
        submitted_at: "2026-09-22T19:00:00Z",
        template_nickname: "Housing permit",
        stage: "as_built",
        checklist_id: "12345678-1234-1234-1234-123456789012"
      )
      [%w[Residential Addition], []].each do |tags|
        report[:identity][:tags] = tags
        described_class
          .new
          .render(report) do |path|
            pages = PDF::Reader.new(path).pages
            cover = pages.first.text.gsub(/\s+/, " ")
            expect(cover).to include(
              "42 Current Avenue",
              "Example Municipality",
              "Alex Applicant",
              "APP-042",
              "Submission version 2",
              "Submission date",
              "Export date",
              "current application information at export",
              tags.any? ? "Residential | Addition" : "Housing permit"
            )
            expect(pages[1].text).to include("Saved answer")
          end
      end
    end

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
          expect(text).to match(
            %r{Application / reference number\s+Not provided}
          )
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
          text = reader.pages.map(&:text).join(" ").gsub(/-\s+/, "-")
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

    it "wraps Part 9 assembly descriptions and notes inside the Details column" do
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
      summary = fixture[:checklist][:building_characteristics_summary]
      summary[:windows_glazed_doors][:lines] = [
        {
          details: (["WRAPASSEMBLY"] * 36).join(" "),
          performance_value: "1.50",
          shgc: "0.25"
        }
      ]
      summary[:other_lines] = [{ details: (["WRAPOTHER"] * 32).join(" ") }]
      summary[:fossil_fuels] = {
        presence: "yes",
        details: (["WRAPFUEL"] * 45).join(" ")
      }
      described_class
        .new
        .render(fixture) do |path|
          reader = PDF::Reader.new(path)
          text = reader.pages.map(&:text).join(" ")
          {
            "WRAPASSEMBLY" => 36,
            "WRAPOTHER" => 32,
            "WRAPFUEL" => 45
          }.each do |marker, count|
            expect(text.scan(marker).length).to eq(count)
            runs =
              reader
                .pages
                .flat_map(&:runs)
                .select { |run| run.text.include?(marker) }
            expect(runs.map(&:y).uniq.length).to be > 1
            reader.pages.each do |page|
              details = page.runs.select { |run| run.text.include?(marker) }
              next if details.empty?
              header =
                page.runs.find { |run| run.text.include?("Performance values") }
              expect(header).to be_present
              # The second header starts after its 8pt left padding. Every detail
              # line must end inside the first column, rather than span both.
              details.each { |run| expect(run.endx).to be < header.x - 8 }
            end
          end
          expect(text).to include("1.50", "0.25")
        end
    end

    [
      ["as_built", "2.0", nil, "2.0", "-"],
      ["pre_construction", "0", false, "0", "No"],
      ["mid_construction", nil, true, "-", "Yes"]
    ].each do |stage, ach, compliance, expected_target, expected_compliance|
      it "retains the untyped Part 9 ACH value and compliance state for #{stage}" do
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
        checklist = fixture[:checklist]
        checklist[:stage] = stage
        fixture[:identity][:stage] = stage
        fixture[:identity][:number] = nil
        checklist[:epc_calculation_airtightness] = "three_point_two"
        checklist[:epc_calculation_testing_target_type] = nil
        checklist[:epc_calculation_compliance] = compliance
        checklist[:selected_report][:energy][:ach] = ach
        original = Marshal.dump(fixture)
        described_class
          .new
          .render(fixture) do |path|
            text = PDF::Reader.new(path).pages.map(&:text).join(" ")
            expect(text).not_to include("Not provided")
            expect(text).to include("3.2 ACH", stage.tr("_", " "))
            expect(text).to match(
              /OR Testing Target\s+#{Regexp.escape(expected_target)}\s+-/
            )
            expect(text).to match(
              /#{Regexp.escape(expected_compliance)}\s+—\s+The above calculation was performed/
            )
            expect(text).to match(%r{Application / reference number\s+-})
          end
        expect(Marshal.dump(fixture)).to eq(original)
      end
    end

    %w[ach nla nlr].each do |target|
      it "does not substitute another value for a missing selected #{target} target" do
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
        checklist = fixture[:checklist]
        checklist[:epc_calculation_testing_target_type] = target
        checklist[:selected_report][:energy].merge!(
          ach: "1.23",
          nla: "9.87",
          nlr: "6.54"
        )
        checklist[:selected_report][:energy][target.to_sym] = nil
        described_class
          .new
          .render(fixture) do |path|
            text = PDF::Reader.new(path).pages.map(&:text).join(" ")
            expect(text).to match(/OR Testing Target\s+-\s+#{target.upcase}/)
            expect(text).not_to include("Not provided")
          end
      end

      it "prints serialized Part 9 values and independent results for #{target}" do
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
        checklist = fixture[:checklist]
        checklist[:epc_calculation_testing_target_type] = target
        checklist[:dwh_heating_consumption] = 0
        checklist[:building_characteristics_summary][:ventilation_lines] = [
          {
            details: "AUDIT-VENTILATION",
            percent_eff: "88.76",
            liters_per_sec: "54.32"
          }
        ]
        checklist[:selected_report][:energy].merge!(
          ach: "1.23",
          nla: "9.87",
          nlr: "6.54",
          meui_passed: true,
          tedi_passed: true,
          airtightness_passed: false
        )
        checklist[:selected_report][:zero_carbon].merge!(
          co2_passed: true,
          ghg_passed: true,
          prescriptive_passed: false
        )
        original = Marshal.dump(fixture)
        described_class
          .new
          .render(fixture) do |path|
            text = PDF::Reader.new(path).pages.map(&:text).join(" ")
            expect(text).to include("88.76", "54.32")
            expect(text).not_to include("Not provided")
            # Each failed criterion and its overall table result must show Fail,
            # even though the unrelated MEUI and CO2 checks passed.
            expect(
              text.gsub(/Pass\s+or\s+Fail/i, "").scan(/\bFail\b/).length
            ).to eq(4)
            target_value = {
              "ach" => "1.23",
              "nla" => "9.87",
              "nlr" => "6.54"
            }.fetch(target)
            expect(text).to match(
              /OR Testing Target\s+#{Regexp.escape(target_value)}/i
            )
            expect(text).to include("123.25") # HVAC + a saved zero hot-water value.
          end
        expect(Marshal.dump(fixture)).to eq(original)
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
            if name.start_with?("part3")
              expect(text).not_to include("Not provided")
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

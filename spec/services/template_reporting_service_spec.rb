require "rails_helper"

RSpec.describe TemplateReportingService do
  let(:template_version) { instance_double("TemplateVersion") }

  describe "#summary_csv" do
    it "outputs rows with elective and jurisdiction customization counts" do
      allow(template_version).to receive(:form_json_requirements).and_return(
        [
          {
            "id" => "r1",
            "label" => "Req 1",
            "elective" => true,
            "requirement_block_id" => "rb1"
          },
          {
            "id" => "r2",
            "label" => "Req 2",
            "elective" => false,
            "requirement_block_id" => "rb2"
          }
        ]
      )
      allow(I18n).to receive(:t).with(
        "export.requirement_summary_csv_headers"
      ).and_return("label,elective,count,bylaw,policy,zoning")

      allow(Jurisdiction).to receive(:count).and_return(10)
      allow(JurisdictionTemplateVersionCustomization).to receive(
        :count_of_jurisdictions_using_requirement
      ).and_return(3)
      allow(JurisdictionTemplateVersionCustomization).to receive(
        :requirement_count_by_reason
      ).and_return(1)

      csv = described_class.new(template_version).summary_csv

      expect(csv).to include("label,elective")
      expect(csv).to include("Req 1,true,3,1,1,1")
      expect(csv).to include("Req 2,false,10,1,1,1")
    end
  end

  describe "#to_json" do
    it "serializes form_json and customizations" do
      allow(template_version).to receive(:form_json).and_return({ "a" => 1 })
      customizations =
        instance_double("Customization", customizations: { "x" => 2 })

      json = described_class.new(template_version, customizations).to_json
      parsed = JSON.parse(json)

      expect(parsed["form_json"]).to eq({ "a" => 1 })
      expect(parsed["customizations"]).to eq({ "x" => 2 })
    end
  end

  describe "#to_csv" do
    it "includes requirement block tip and elective enablement from customizations" do
      allow(I18n).to receive(:t).with(
        "export.template_version_csv_headers"
      ).and_return(
        "section,tip,question,code,type,optional,elective,enabled,reason"
      )
      allow(template_version).to receive(:requirement_blocks_json).and_return(
        {
          "b1" => {
            "name" => "Block 1",
            "requirements" => [
              {
                "id" => "r1",
                "label" => "Q1",
                "requirement_code" => "C1",
                "input_type" => "text",
                "required" => true,
                "elective" => true
              }
            ]
          }
        }
      )

      customizations = {
        "requirement_block_changes" => {
          "b1" => {
            "tip" => "Tip!",
            "enabled_elective_field_ids" => ["r1"],
            "enabled_elective_field_reasons" => {
              "r1" => "policy"
            }
          }
        }
      }

      csv =
        described_class.new(
          template_version,
          instance_double("JTV", customizations: customizations)
        ).to_csv

      expect(csv).to include("Block 1,Tip!")
      expect(csv).to include("Q1,C1,text,false,true,true,policy")
    end
  end
end

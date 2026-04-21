require "rails_helper"

RSpec.describe ExternalPermitApplicationService do
  let(:template_version) { instance_double("TemplateVersion") }
  let(:supporting_documents_assoc) { double("SupportingDocuments") }

  let(:permit_application) do
    instance_double(
      "PermitApplication",
      submission_data: submission_data,
      template_version: template_version,
      supporting_documents: supporting_documents_assoc,
      latest_submission_version: latest_submission_version,
      step_code: step_code
    )
  end

  let(:latest_submission_version) { nil }
  let(:step_code) { nil }

  subject(:service) { described_class.new(permit_application) }

  describe "#formatted_submission_data_for_external_use" do
    let(:submission_data) { nil }

    it "returns empty hash when no submission data is present" do
      expect(service.formatted_submission_data_for_external_use).to eq({})
    end

    context "with submission data" do
      let(:submission_data) do
        {
          "data" => {
            "s1" => {
              "prefix|RBblock-1|field1" => "value",
              "prefix|RBblock-1|multi_contact" => [
                {
                  "x|firstName" => "A",
                  "x|lastName" => "B",
                  "x|email" => "a@b.com"
                }
              ],
              "prefix|RBblock-1|general_contact|email" => "gc@example.com"
            }
          }
        }
      end

      before do
        allow(template_version).to receive(:requirement_blocks_json).and_return(
          {
            "block-1" => {
              "id" => "block-1",
              "sku" => "rb_sku",
              "name" => "Block",
              "description" => "Desc",
              "requirements" => [
                {
                  "id" => "r1",
                  "label" => "Field 1",
                  "requirement_code" => "code1",
                  "input_type" => "text",
                  "form_json" => {
                    "key" => "whatever|RBblock-1|field1"
                  }
                },
                {
                  "id" => "r2",
                  "label" => "Contacts",
                  "requirement_code" => "contacts",
                  "input_type" => "multi_contact",
                  "form_json" => {
                    "key" => "whatever|RBblock-1|multi_contact"
                  }
                },
                {
                  "id" => "r3",
                  "label" => "General contact",
                  "requirement_code" => "gc",
                  "input_type" => "general_contact",
                  "form_json" => {
                    "key" => "whatever|RBblock-1|general_contact"
                  }
                }
              ]
            }
          }
        )
      end

      it "formats multi_contact to snake_case keys and merges single contact fragments into an array" do
        result = service.formatted_submission_data_for_external_use

        block = result["rb_sku"]
        expect(block[:name]).to eq("Block")

        contact_req =
          block[:requirements].find { |r| r[:requirement_code] == "contacts" }
        expect(contact_req[:value]).to eq(
          [{ "first_name" => "A", "last_name" => "B", "email" => "a@b.com" }]
        )

        gc_req = block[:requirements].find { |r| r[:requirement_code] == "gc" }
        expect(gc_req[:value]).to eq([{ "email" => "gc@example.com" }])
      end

      it "formats file requirements into url objects using supporting documents" do
        allow(template_version).to receive(:requirement_blocks_json).and_return(
          {
            "block-1" => {
              "id" => "block-1",
              "sku" => "rb_sku",
              "name" => "Block",
              "description" => "Desc",
              "requirements" => [
                {
                  "id" => "r1",
                  "label" => "File",
                  "requirement_code" => "file1",
                  "input_type" => "file",
                  "form_json" => {
                    "key" => "whatever|RBblock-1|file_field"
                  }
                }
              ]
            }
          }
        )

        permit_application_submission = {
          "data" => {
            "s1" => {
              "prefix|RBblock-1|file_field" => [
                {
                  "model" => "SupportingDocument",
                  "modelId" => "doc-1",
                  "type" => "application/pdf",
                  "size" => 12,
                  "metadata" => {
                    "filename" => "a.pdf"
                  }
                }
              ]
            }
          }
        }
        allow(permit_application).to receive(:submission_data).and_return(
          permit_application_submission
        )

        doc =
          instance_double(
            "SupportingDocument",
            file_url: "http://example",
            id: "doc-1"
          )
        allow(supporting_documents_assoc).to receive(:find_by).with(
          id: "doc-1"
        ).and_return(doc)

        result = service.formatted_submission_data_for_external_use
        req = result["rb_sku"][:requirements].first
        expect(req[:value]).to eq(
          [
            {
              id: "doc-1",
              name: "a.pdf",
              type: "application/pdf",
              size: 12,
              url: "http://example"
            }
          ]
        )
      end
    end
  end

  describe "#get_raw_h2k_files" do
    let(:submission_data) { { "data" => {} } }

    it "returns nil if step_code is missing or does not support pre_construction_checklist" do
      expect(service.get_raw_h2k_files).to be_nil

      sc = instance_double("StepCode")
      allow(permit_application).to receive(:step_code).and_return(sc)
      expect(service.get_raw_h2k_files).to be_nil
    end

    it "returns file hashes for checklist data entries" do
      entry1 =
        instance_double(
          "DataEntry",
          id: "de1",
          h2k_file_url: "http://h2k",
          h2k_file_name: "f.h2k",
          h2k_file_type: "application/octet-stream",
          h2k_file_size: 123
        )
      checklist = instance_double("Checklist", data_entries: [entry1])
      sc = double("StepCode", pre_construction_checklist: checklist)
      allow(permit_application).to receive(:step_code).and_return(sc)

      expect(service.get_raw_h2k_files).to eq(
        [
          {
            id: "de1",
            name: "f.h2k",
            type: "application/octet-stream",
            size: 123,
            url: "http://h2k"
          }
        ]
      )
    end
  end
end

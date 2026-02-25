require "rails_helper"

RSpec.describe Wrappers::Archistar, type: :service do
  subject(:wrapper) { described_class.new }

  describe "#comply_certificates" do
    it "calls the comply certificates endpoint with city key" do
      expect(wrapper).to receive(:get).with(
        "comply-certificates",
        { cityKey: "my-city" }
      ).and_return([])

      wrapper.comply_certificates("my-city")
    end
  end

  describe "#get_submission_pdf_report" do
    it "returns the link from response" do
      allow(wrapper).to receive(:get).and_return(
        { "link" => "https://example.test/report.pdf" }
      )

      expect(wrapper.get_submission_pdf_report("ext-1")).to eq(
        "https://example.test/report.pdf"
      )
    end
  end

  describe "#create_submission" do
    it "returns nil when there is no primary design document file" do
      pre_check = instance_double("PreCheck", primary_design_document: nil)

      expect(wrapper.create_submission(pre_check)).to be_nil
    end

    it "posts a payload and returns certificate number" do
      file =
        instance_double(
          "ShrineFile",
          original_filename: "design.pdf",
          url: "https://example.test/design.pdf"
        )
      design_document = instance_double("DesignDocument", file: file)
      pre_check =
        instance_double(
          "PreCheck",
          primary_design_document: design_document,
          comply_certificate_id: "cert-1",
          formatted_address: "123 Main St",
          latitude: 49.2,
          longitude: -123.1
        )
      allow(wrapper).to receive(:post).and_return(
        { "certificate_no" => "C-100" }
      )

      expect(wrapper.create_submission(pre_check)).to eq("C-100")
      expect(wrapper).to have_received(:post).with(
        "submissions",
        a_string_including("\"complyCertificateId\":\"cert-1\"")
      )
    end
  end
end

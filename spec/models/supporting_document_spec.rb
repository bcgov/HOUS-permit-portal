require "rails_helper"

RSpec.describe SupportingDocument, type: :model do
  it { should belong_to(:permit_application) }

  describe "#file_url" do
    it "uses the original uploaded filename instead of standardized_filename" do
      document =
        create(
          :supporting_document,
          data_key: "section|plan_file",
          file_data: {
            "id" => "cache/uuid-plan.pdf",
            "storage" => "store",
            "metadata" => {
              "filename" => "Owner Plans.pdf",
              "mime_type" => "application/pdf",
              "size" => 123
            }
          }
        )
      uploaded_file = document.file
      allow(document).to receive(:file).and_return(uploaded_file)
      allow(uploaded_file).to receive(:url).and_return(
        "https://example.com/file"
      )

      document.file_url

      expect(uploaded_file).to have_received(:url).with(
        public: false,
        expires_in: 3600,
        response_content_disposition: include("Owner Plans.pdf")
      )
      expect(uploaded_file).not_to have_received(:url).with(
        response_content_disposition: include(document.standardized_filename)
      )
    end
  end
end

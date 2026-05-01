require "rails_helper"

RSpec.describe FileUploadAttachment, type: :model do
  # FileUploadAttachment is abstract; exercise behavior through a concrete subclass.
  let(:document) { create(:design_document) }

  describe "scan_status" do
    it "defaults to pending" do
      expect(document.scan_status).to eq("pending")
      expect(document).to be_pending
    end

    it "supports infected/clean states" do
      document.update!(scan_status: :infected)
      expect(document).to be_infected
      expect(document.scan_complete?).to eq(true)
    end
  end

  describe "scopes" do
    it "with_file returns records with file_data and not infected" do
      with_file = create(:design_document)
      with_file.update_columns(
        scan_status: "clean",
        file_data: { "id" => SecureRandom.uuid }.to_json
      )

      without_file = create(:design_document)
      without_file.update_column(:file_data, nil)

      infected = create(:design_document)
      infected.update_columns(
        scan_status: "infected",
        file_data: { "id" => SecureRandom.uuid }.to_json
      )

      expect(DesignDocument.with_file).to match_array([with_file])
      expect(DesignDocument.without_file).to match_array(
        [without_file, infected]
      )
    end
  end

  describe "#file_data" do
    it "parses JSON strings into a hash" do
      document.update_column(
        :file_data,
        {
          "id" => "abc",
          "metadata" => {
            "size" => 123,
            "filename" => "x.pdf",
            "mime_type" => "application/pdf"
          }
        }.to_json
      )

      expect(document.file_data).to be_a(Hash)
      expect(document.file_id).to eq("abc")
      expect(document.file_size).to eq(123)
      expect(document.file_name).to eq("x.pdf")
      expect(document.file_type).to eq("application/pdf")
    end

    it "returns {} for invalid JSON strings" do
      document.update_column(:file_data, "{not-json")
      expect(document.file_data).to eq({})
    end
  end

  describe "download filenames" do
    [
      [:design_document, "sample_drawing.pdf"],
      [:requirement_document, "requirement.pdf"],
      [:project_document, "project.pdf"],
      [:resource_document, "resource.pdf"],
      [:report_document, "report.pdf"]
    ].each do |factory_name, expected_filename|
      it "preserves metadata filename for #{factory_name}" do
        concrete_document = create(factory_name)
        concrete_document.update_column(
          :file_data,
          {
            "id" => "#{factory_name}.pdf",
            "metadata" => {
              "filename" => expected_filename
            }
          }.to_json
        )

        expect(concrete_document.download_filename).to eq(expected_filename)
      end
    end

    it "uses metadata filename before Shrine original_filename" do
      document.update_column(
        :file_data,
        {
          "id" => "stored-id.pdf",
          "metadata" => {
            "filename" => "Original Upload.pdf"
          }
        }.to_json
      )
      uploaded_file = document.file
      allow(document).to receive(:file).and_return(uploaded_file)
      allow(uploaded_file).to receive(:original_filename).and_return(
        "stored-id.pdf"
      )

      expect(document.download_filename).to eq("Original Upload.pdf")
    end

    it "falls back to Shrine original_filename when metadata filename is blank" do
      document.update_column(
        :file_data,
        { "id" => "stored-id.pdf", "metadata" => {} }.to_json
      )
      uploaded_file = document.file
      allow(document).to receive(:file).and_return(uploaded_file)
      allow(uploaded_file).to receive(:original_filename).and_return(
        "stored-id.pdf"
      )

      expect(document.download_filename).to eq("stored-id.pdf")
    end

    it "formats file_url content disposition with the metadata filename" do
      document.update_column(
        :file_data,
        {
          "id" => "stored-id.pdf",
          "metadata" => {
            "filename" => "Original Upload.pdf"
          }
        }.to_json
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
        response_content_disposition: include("Original Upload.pdf")
      )
    end
  end

  describe "availability helpers" do
    it "returns false when id is missing" do
      document.update_columns(
        scan_status: "clean",
        file_data: { "metadata" => {} }.to_json
      )
      expect(document.file_available?).to eq(false)
      expect(document.file_url_safe).to be_nil
    end

    it "returns nil from file_url_safe when file_url raises" do
      document.update_columns(
        scan_status: "clean",
        file_data: { "id" => SecureRandom.uuid, "metadata" => {} }.to_json
      )
      allow(document).to receive(:file_url).and_raise(StandardError)

      expect(document.file_available?).to eq(true)
      expect(document.file_url_safe).to be_nil
    end
  end

  describe "#upload_failed_notification_data" do
    it "includes permit_application_id when attached_to responds to permit_application" do
      data = document.upload_failed_notification_data

      expect(data).to include("id", "action_type", "action_text", "object_data")
      expect(data["object_data"]).to include(
        "record_type" => "DesignDocument",
        "record_id" => document.id
      )
      expect(data["object_data"]["permit_application_id"]).to eq(
        document.attached_to.permit_application_id
      )
    end
  end
end

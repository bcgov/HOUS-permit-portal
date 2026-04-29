require "rails_helper"

RSpec.describe SupportingDocumentsZipper do
  describe "#perform" do
    let(:submitter) do
      instance_double("User", first_name: "Jane", last_name: "Doe")
    end

    let(:document1) do
      instance_double(
        "SupportingDocument",
        id: "doc-1",
        file_url: "https://example.com/file1.pdf",
        download_filename: "Original File.pdf",
        standardized_filename: "file1.pdf",
        save: true
      )
    end

    let(:document2) do
      instance_double(
        "SupportingDocument",
        id: "doc-2",
        file_url: "https://example.com/file2.pdf",
        download_filename: "Other Original.pdf",
        standardized_filename: "file2.pdf",
        save: true
      )
    end

    let(:permit_application) do
      instance_double(
        "PermitApplication",
        id: "pa-1",
        number: "PA-0001",
        submitter: submitter,
        all_submission_version_completed_supporting_documents: [
          document1,
          document2
        ],
        save: true,
        errors: double("Errors", full_messages: [])
      )
    end

    let(:zipfile_uploader) { instance_double("ZipfileUploader") }
    let(:zip_entry_zipfile) { instance_double("Zip::File") }

    before do
      allow(PermitApplication).to receive(:find).and_return(permit_application)
      allow(FileUtils).to receive(:mkdir_p)
      allow(File).to receive(:directory?).and_return(true)
      allow(FileUtils).to receive(:rm_f)

      allow(Zip::File).to receive(:open).and_yield(zip_entry_zipfile)
      allow(zip_entry_zipfile).to receive(:add)

      allow(ZipfileUploader).to receive(:new).with(:store).and_return(
        zipfile_uploader
      )
      allow(zipfile_uploader).to receive(:upload).and_return(
        instance_double("UploadedFile", data: { "id" => "zip-1" })
      )

      allow(File).to receive(:open).and_yield(
        instance_double("File", path: "/tmp/test.zip")
      )

      allow(permit_application).to receive(:zipfile_data=)
    end

    it "creates a zip, uploads it, and cleans up temp files" do
      zipper = described_class.new(permit_application.id)

      allow(zipper).to receive(:download_file).with(document1).and_return(
        "/tmp/f1.pdf"
      )
      allow(zipper).to receive(:download_file).with(document2).and_return(
        "/tmp/f2.pdf"
      )

      zipper.perform

      expect(zip_entry_zipfile).to have_received(:add).with(
        "Original File.pdf",
        "/tmp/f1.pdf"
      )
      expect(zip_entry_zipfile).to have_received(:add).with(
        "Other Original.pdf",
        "/tmp/f2.pdf"
      )
      expect(zipfile_uploader).to have_received(:upload)
      expect(permit_application).to have_received(:zipfile_data=).with(
        { "id" => "zip-1" }
      )
      expect(permit_application).to have_received(:save)
      expect(FileUtils).to have_received(:rm_f).at_least(:once)
    end

    it "skips adding documents that fail to download" do
      zipper = described_class.new(permit_application.id)

      allow(zipper).to receive(:download_file).with(document1).and_return(nil)
      allow(zipper).to receive(:download_file).with(document2).and_return(
        "/tmp/f2.pdf"
      )

      zipper.perform

      expect(zip_entry_zipfile).not_to have_received(:add).with(
        "Original File.pdf",
        anything
      )
      expect(zip_entry_zipfile).to have_received(:add).with(
        "Other Original.pdf",
        "/tmp/f2.pdf"
      )
    end

    it "deduplicates original filenames inside the zip" do
      allow(document1).to receive(:download_filename).and_return("drawing.pdf")
      allow(document2).to receive(:download_filename).and_return("drawing.pdf")
      zipper = described_class.new(permit_application.id)

      allow(zipper).to receive(:download_file).with(document1).and_return(
        "/tmp/f1.pdf"
      )
      allow(zipper).to receive(:download_file).with(document2).and_return(
        "/tmp/f2.pdf"
      )

      zipper.perform

      expect(zip_entry_zipfile).to have_received(:add).with(
        "drawing.pdf",
        "/tmp/f1.pdf"
      )
      expect(zip_entry_zipfile).to have_received(:add).with(
        "drawing (2).pdf",
        "/tmp/f2.pdf"
      )
    end

    it "logs an error if permit application fails to save" do
      allow(permit_application).to receive(:save).and_return(false)
      allow(permit_application).to receive(:errors).and_return(
        double("Errors", full_messages: ["nope"])
      )
      allow(Rails.logger).to receive(:error)

      zipper = described_class.new(permit_application.id)
      allow(zipper).to receive(:download_file).and_return("/tmp/f.pdf")

      zipper.perform

      expect(Rails.logger).to have_received(:error).with(
        /Failed to upload zip file:/
      )
    end
  end

  describe "private download_file" do
    let(:submitter) do
      instance_double("User", first_name: "Jane", last_name: "Doe")
    end

    let(:permit_application) do
      instance_double(
        "PermitApplication",
        id: "pa-1",
        number: "PA-0001",
        submitter: submitter,
        all_submission_version_completed_supporting_documents: [],
        save: true,
        errors: double("Errors", full_messages: [])
      )
    end

    let(:document) do
      instance_double(
        "SupportingDocument",
        id: "doc-1",
        file_url: "https://example.com/file.pdf",
        download_filename: "file.pdf",
        standardized_filename: "file.pdf",
        save: true
      )
    end

    before do
      allow(PermitApplication).to receive(:find).and_return(permit_application)
      allow(FileUtils).to receive(:mkdir_p)
      allow(File).to receive(:directory?).and_return(true)
      allow(FileUtils).to receive(:rm_f)
    end

    it "downloads a file and tracks the temp file path" do
      zipper = described_class.new(permit_application.id)

      response = instance_double("Net::HTTPResponse", read_body: nil)
      allow(response).to receive(:read_body).and_yield("%PDF-1.4")

      http = instance_double("Net::HTTP")
      allow(http).to receive(:request).and_yield(response)

      allow(Net::HTTP).to receive(:start).and_yield(http)

      path = zipper.send(:download_file, document)

      expect(path).to be_present
      expect(File.exist?(path)).to eq(true)
      expect(zipper.temp_files).to include(path)
    end

    it "returns nil and logs when download fails" do
      zipper = described_class.new(permit_application.id)
      allow(Net::HTTP).to receive(:start).and_raise(StandardError.new("nope"))
      allow(Rails.logger).to receive(:error)

      path = zipper.send(:download_file, document)

      expect(path).to be_nil
      expect(Rails.logger).to have_received(:error).with(
        /Failed to download file:/
      )
    end
  end
end

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

    let(:submission_version) do
      instance_double(
        "SubmissionVersion",
        save: true,
        errors: double("Errors", full_messages: [])
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
        latest_submission_version: submission_version
      )
    end

    let(:zipfile_uploader) { instance_double("ZipfileUploader") }
    let(:zip_entry_zipfile) { instance_double("Zip::File") }

    before do
      allow(Time.zone).to receive(:today).and_return(Date.new(2026, 4, 29))
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

      allow(submission_version).to receive(:zipfile_data=)
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
      expect(File).to have_received(:open).with(
        end_with("PA-0001_2026-04-29_supporting-documents.zip"),
        "rb"
      )
      expect(submission_version).to have_received(:zipfile_data=).with(
        { "id" => "zip-1" }
      )
      expect(submission_version).to have_received(:save)
      expect(FileUtils).to have_received(:rm_f).at_least(:once)
    end

    it "zips only the requested document ids" do
      zipper =
        described_class.new(permit_application.id, document_ids: [document2.id])

      allow(zipper).to receive(:download_file).with(document2).and_return(
        "/tmp/f2.pdf"
      )
      allow(File).to receive(:binread).and_return("zip-bytes")

      zipper.with_zip do |path|
        expect(path.to_s).to end_with(
          "PA-0001_2026-04-29_supporting-documents.zip"
        )
      end

      expect(zip_entry_zipfile).not_to have_received(:add).with(
        "Original File.pdf",
        anything
      )
      expect(zip_entry_zipfile).to have_received(:add).with(
        "Other Original.pdf",
        "/tmp/f2.pdf"
      )
      expect(zipfile_uploader).not_to have_received(:upload)
      expect(FileUtils).to have_received(:rm_f).at_least(:once)
    end

    context "with selected submission versions" do
      let(:versions) { double("Submission versions") }
      let(:answers) do
        {
          "data" => {
            "equipment" => {
              "modelId" => "equipment-1"
            },
            "rows" => [
              {
                "equipment" => {
                  "model_id" => "equipment-2"
                },
                "drawings_file" => [
                  { "modelId" => document1.id },
                  { "model_id" => document2.id }
                ]
              }
            ]
          }
        }
      end

      before do
        allow(permit_application).to receive(:submission_versions).and_return(
          versions
        )
        allow(versions).to receive(:where).with(id: ["version-1"]).and_return(
          [submission_version]
        )
        allow(submission_version).to receive(
          :report_submission_data
        ).and_return(answers)
      end

      it "includes nested file references in either casing and ignores non-file model ids" do
        zipper =
          described_class.new(permit_application.id, version_ids: ["version-1"])
        allow(zipper).to receive(:download_file).with(document1).and_return(
          "/tmp/f1.pdf"
        )
        allow(zipper).to receive(:download_file).with(document2).and_return(
          "/tmp/f2.pdf"
        )

        zipper.with_zip { |_path| }

        expect(zip_entry_zipfile).to have_received(:add).with(
          "Original File.pdf",
          "/tmp/f1.pdf"
        )
        expect(zip_entry_zipfile).to have_received(:add).with(
          "Other Original.pdf",
          "/tmp/f2.pdf"
        )
      end

      it "still rejects a missing attachment referenced by a file field" do
        answers["data"]["rows"][0]["drawings_file"] << {
          "modelId" => "missing-document"
        }

        expect do
          described_class.new(permit_application.id, version_ids: ["version-1"])
        end.to raise_error("Required supporting documents are unavailable")
        expect(zipfile_uploader).not_to have_received(:upload)
      end

      it "excludes later-version uploads and PDFs while keeping the selected version PDF" do
        selected_pdf =
          instance_double(
            "SupportingDocument",
            id: "pdf-1",
            submission_version_id: "version-1",
            data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY,
            download_filename: "Application.pdf"
          )
        later_pdf =
          instance_double(
            "SupportingDocument",
            id: "pdf-2",
            submission_version_id: "version-2"
          )
        allow(document2).to receive(:submission_version_id).and_return(
          "version-2"
        )
        answers["data"]["rows"][0]["drawings_file"] = [
          { "modelId" => document1.id }
        ]
        allow(permit_application).to receive(
          :all_submission_version_completed_supporting_documents
        ).and_return([document1, document2, selected_pdf, later_pdf])
        zipper =
          described_class.new(permit_application.id, version_ids: ["version-1"])
        allow(zipper).to receive(:download_file).with(document1).and_return(
          "/tmp/f1.pdf"
        )
        allow(zipper).to receive(:download_file).with(selected_pdf).and_return(
          "/tmp/application.pdf"
        )

        zipper.with_zip { |_path| }

        expect(zip_entry_zipfile).to have_received(:add).exactly(2).times
        expect(zip_entry_zipfile).to have_received(:add).with(
          "Original File.pdf",
          "/tmp/f1.pdf"
        )
        expect(zip_entry_zipfile).to have_received(:add).with(
          "Application.pdf",
          "/tmp/application.pdf"
        )
      end
    end

    it "fails without uploading an incomplete ZIP" do
      zipper = described_class.new(permit_application.id)
      allow(zipper).to receive(:download_file).with(document1).and_return(nil)
      expect { zipper.perform }.to raise_error(/Required ZIP member/)
      expect(zipfile_uploader).not_to have_received(:upload)
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

    it "raises if submission version fails to save" do
      allow(submission_version).to receive(:save).and_return(false)
      allow(submission_version).to receive(:errors).and_return(
        double("Errors", full_messages: ["nope"])
      )
      allow(Rails.logger).to receive(:error)

      zipper = described_class.new(permit_application.id)
      allow(zipper).to receive(:download_file).and_return("/tmp/f.pdf")

      expect { zipper.perform }.to raise_error(/Failed to save ZIP attachment/)
    end

    it "raises if there is no submission version" do
      allow(permit_application).to receive(
        :latest_submission_version
      ).and_return(nil)
      allow(Rails.logger).to receive(:error)

      zipper = described_class.new(permit_application.id)
      allow(zipper).to receive(:download_file).and_return("/tmp/f.pdf")

      expect { zipper.perform }.to raise_error(/no submission version/)
      expect(zipfile_uploader).not_to have_received(:upload)
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
        latest_submission_version: nil,
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

      response = Net::HTTPOK.new("1.1", "200", "OK")
      allow(response).to receive(:read_body).and_yield("%PDF-1.4")

      http = instance_double("Net::HTTP")
      allow(http).to receive(:request).and_yield(response)

      allow(Net::HTTP).to receive(:start).and_yield(http)

      path = zipper.send(:download_file, document)

      expect(path).to be_present
      expect(File.exist?(path)).to eq(true)
      expect(zipper.temp_files.map(&:path)).to include(path)
    end

    it "raises and logs a sanitized error when download fails" do
      zipper = described_class.new(permit_application.id)
      allow(Net::HTTP).to receive(:start).and_raise(StandardError.new("nope"))
      allow(Rails.logger).to receive(:error)

      expect { zipper.send(:download_file, document) }.to raise_error("nope")
      expect(Rails.logger).to have_received(:error).with(
        /Failed to download ZIP member/
      )
    end
  end
end

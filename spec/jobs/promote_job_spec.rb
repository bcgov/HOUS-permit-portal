require "rails_helper"
require "sidekiq/testing"

RSpec.describe PromoteJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "has no unique lock so retries are not suppressed" do
    opts = described_class.get_sidekiq_options
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

  it "promotes after a successful virus scan and marks record clean" do
    attacher =
      instance_double("Attacher", atomic_promote: true, file: double("File"))
    attacher_class = class_double("SomeAttacher", retrieve: attacher)
    stub_const("SomeAttacher", attacher_class)

    record =
      instance_double(
        "Upload",
        id: "r1",
        data_key: "user_upload",
        update_column: true
      )
    allow(record).to receive(:respond_to?).with(:data_key).and_return(true)
    allow(record).to receive(:respond_to?).with(:scan_status=).and_return(true)
    record_class = class_double("Upload", find: record)
    stub_const("Upload", record_class)

    scanner = instance_double("VirusScanService", scan!: true)
    allow(VirusScanService).to receive(:new).and_return(scanner)

    described_class.perform_async(
      "SomeAttacher",
      "Upload",
      "r1",
      "file",
      { "id" => "f1" }
    )
    described_class.perform_one

    expect(scanner).to have_received(:scan!)
    expect(attacher).to have_received(:atomic_promote)
    expect(record).to have_received(:update_column).with(:scan_status, :clean)
  end

  it "handles infected files without raising" do
    file = instance_double("ShrineFile", delete: true)
    attacher = instance_double("Attacher", file: file, atomic_promote: true)
    attacher_class = class_double("SomeAttacher", retrieve: attacher)
    stub_const("SomeAttacher", attacher_class)

    record =
      double(
        "FileUploadAttachment",
        id: "r1",
        data_key: "user_upload",
        file_name: "bad.pdf",
        update_columns: true,
        update_column: true
      )
    allow(record).to receive(:respond_to?).with(:data_key).and_return(true)
    allow(record).to receive(:respond_to?).with(:file_data).and_return(true)
    allow(record).to receive(:respond_to?).with(:scan_status=).and_return(true)
    allow(record).to receive(:is_a?).and_return(false)
    allow(record).to receive(:is_a?).with(FileUploadAttachment).and_return(true)
    allow(record).to receive(:try).with(:file_name).and_return("bad.pdf")
    record_class = class_double("FileUploadAttachment", find: record)
    stub_const("FileUploadAttachment", record_class)

    scanner = instance_double("VirusScanService")
    allow(scanner).to receive(:scan!).and_raise(
      VirusScanService::InfectedFileError.new("infected", virus_name: "EICAR")
    )
    allow(VirusScanService).to receive(:new).and_return(scanner)
    allow(NotificationService).to receive(:publish_file_upload_failed_event)

    described_class.perform_async(
      "SomeAttacher",
      "FileUploadAttachment",
      "r1",
      "file",
      { "id" => "f1" }
    )

    expect { described_class.perform_one }.not_to raise_error
    expect(record).to have_received(:update_column).with(
      :scan_status,
      :infected
    )
    expect(record).to have_received(:update_columns).with(file_data: nil)
  end

  it "skips scanning when NotEnabledError is raised and still promotes" do
    attacher =
      instance_double("Attacher", atomic_promote: true, file: double("File"))
    attacher_class = class_double("SomeAttacher", retrieve: attacher)
    stub_const("SomeAttacher", attacher_class)

    record = instance_double("Upload", id: "r1", update_column: true)
    allow(record).to receive(:respond_to?).and_return(false)
    record_class = class_double("Upload", find: record)
    stub_const("Upload", record_class)

    allow(VirusScanService).to receive(:new).and_raise(
      VirusScanService::NotEnabledError
    )

    described_class.perform_async(
      "SomeAttacher",
      "Upload",
      "r1",
      "file",
      { "id" => "f1" }
    )
    described_class.perform_one

    expect(attacher).to have_received(:atomic_promote)
  end

  it "skips scanning for system-generated documents by data_key" do
    attacher =
      instance_double("Attacher", atomic_promote: true, file: double("File"))
    attacher_class = class_double("SomeAttacher", retrieve: attacher)
    stub_const("SomeAttacher", attacher_class)

    record =
      instance_double(
        "Upload",
        id: "r1",
        data_key: "permit_application_pdf",
        update_column: true
      )
    allow(record).to receive(:respond_to?).with(:data_key).and_return(true)
    allow(record).to receive(:respond_to?).with(:scan_status=).and_return(true)
    record_class = class_double("Upload", find: record)
    stub_const("Upload", record_class)

    allow(VirusScanService).to receive(:new)

    described_class.new.perform(
      "SomeAttacher",
      "Upload",
      "r1",
      "file",
      { "id" => "f1" }
    )

    expect(VirusScanService).not_to have_received(:new)
    expect(attacher).to have_received(:atomic_promote)
    expect(record).to have_received(:update_column).with(:scan_status, :clean)
  end

  it "no-ops when record is not found" do
    attacher_class = class_double("SomeAttacher")
    stub_const("SomeAttacher", attacher_class)

    record_class = class_double("Upload")
    stub_const("Upload", record_class)
    allow(record_class).to receive(:find).and_raise(
      ActiveRecord::RecordNotFound
    )

    expect do
      described_class.new.perform(
        "SomeAttacher",
        "Upload",
        "missing",
        "file",
        { "id" => "f1" }
      )
    end.not_to raise_error
  end

  it "no-ops when the attachment changed" do
    attacher_class = class_double("SomeAttacher")
    stub_const("SomeAttacher", attacher_class)

    record_class = class_double("Upload")
    stub_const("Upload", record_class)
    allow(record_class).to receive(:find).and_raise(Shrine::AttachmentChanged)

    expect do
      described_class.new.perform(
        "SomeAttacher",
        "Upload",
        "r1",
        "file",
        { "id" => "f1" }
      )
    end.not_to raise_error
  end

  it "re-raises unexpected errors to allow retries" do
    attacher_class = class_double("SomeAttacher")
    stub_const("SomeAttacher", attacher_class)

    record = instance_double("Upload", id: "r1")
    record_class = class_double("Upload", find: record)
    stub_const("Upload", record_class)

    allow(attacher_class).to receive(:retrieve).and_raise(StandardError, "boom")

    expect do
      described_class.new.perform(
        "SomeAttacher",
        "Upload",
        "r1",
        "file",
        { "id" => "f1" }
      )
    end.to raise_error(StandardError, "boom")
  end
end

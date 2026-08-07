require "rails_helper"
require "sidekiq/testing"

RSpec.describe SupportingDocumentsZipDownloadJob, type: :job do
  before { Sidekiq::Testing.fake! }

  let(:permit_application_id) { "pa-1" }
  let(:document_ids) { %w[doc-1 doc-2] }
  let(:request_id) { "req-123" }
  let(:user_id) { "user-1" }
  let(:zip_path) { Pathname.new("/tmp/zipfiles/test.zip") }
  let(:uploaded) { instance_double("Shrine::UploadedFile") }
  let(:uploader) { instance_double("ZipfileUploader") }

  before do
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
  end

  def expect_broadcast(payload)
    expect(WebsocketBroadcaster).to have_received(
      :push_update_to_relevant_users
    ).with(
      [user_id],
      Constants::Websockets::Events::PermitApplication::DOMAIN,
      Constants::Websockets::Events::PermitApplication::TYPES[
        :selective_zip_ready
      ],
      hash_including(payload)
    )
  end

  it "uploads a selective zip via with_zip and broadcasts the download url" do
    zipper = instance_double("SupportingDocumentsZipper")
    allow(SupportingDocumentsZipper).to receive(:new).with(
      permit_application_id,
      document_ids: document_ids
    ).and_return(zipper)
    allow(zipper).to receive(:with_zip).and_yield(zip_path)
    allow(zipper).to receive(:perform)

    allow(File).to receive(:open).with(zip_path.to_s, "rb").and_yield(
      StringIO.new("zip-bytes")
    )
    allow(ZipfileUploader).to receive(:new).with(:store).and_return(uploader)
    allow(uploader).to receive(:upload).and_return(uploaded)
    allow(uploaded).to receive(:url).and_return(
      "https://example.com/selective.zip"
    )

    described_class.new.perform(
      permit_application_id,
      document_ids,
      request_id,
      user_id
    )

    expect(zipper).to have_received(:with_zip)
    expect(zipper).not_to have_received(:perform)
    expect(uploader).to have_received(:upload)
    expect_broadcast(
      id: permit_application_id,
      request_id: request_id,
      zipfile_url: "https://example.com/selective.zip",
      zipfile_name: "test.zip",
      error: false
    )
  end

  it "broadcasts an error payload when zipping fails" do
    allow(SupportingDocumentsZipper).to receive(:new).and_raise(
      StandardError,
      "boom"
    )

    described_class.new.perform(
      permit_application_id,
      document_ids,
      request_id,
      user_id
    )

    expect_broadcast(
      id: permit_application_id,
      request_id: request_id,
      zipfile_url: nil,
      zipfile_name: nil,
      error: true
    )
  end
end

require "rails_helper"
require "sidekiq/testing"

RSpec.describe ZipfileJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "locks by permit_application_id" do
    expect(described_class.lock_args(%w[pa1 x])).to eq(["pa1"])
  end

  it "runs pdf generation + zipper and broadcasts update when permit application exists" do
    pdf_job = instance_double("PdfGenerationJob", perform: true)
    allow(PdfGenerationJob).to receive(:new).and_return(pdf_job)

    zipper = instance_double("SupportingDocumentsZipper", perform: true)
    allow(SupportingDocumentsZipper).to receive(:new).with("pa1").and_return(
      zipper
    )

    pa =
      instance_double(
        "PermitApplication",
        notifiable_users: double("UsersRel", pluck: ["u1"]),
        reload: double("PermitApplication")
      )
    allow(PermitApplication).to receive(:find_by_id).with("pa1").and_return(pa)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return(
      { "p" => 1 }
    )
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)

    described_class.new.perform("pa1")

    expect(pdf_job).to have_received(:perform).with("pa1")
    expect(zipper).to have_received(:perform)
    expect(WebsocketBroadcaster).to have_received(
      :push_update_to_relevant_users
    )
  end

  it "does not broadcast when permit application is missing" do
    allow(PdfGenerationJob).to receive_message_chain(:new, :perform)
    allow(SupportingDocumentsZipper).to receive_message_chain(:new, :perform)
    allow(PermitApplication).to receive(:find_by_id).and_return(nil)
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)

    described_class.new.perform("missing")

    expect(WebsocketBroadcaster).not_to have_received(
      :push_update_to_relevant_users
    )
  end
end

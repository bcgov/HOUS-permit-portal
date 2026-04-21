require "rails_helper"

RSpec.describe StoragePolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("Storage") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "requires a logged-in user for upload actions" do
    logged_in = create(:user)
    p = policy(logged_in)

    expect(p.upload?).to be true
    expect(p.create_multipart_upload?).to be true
    expect(p.batch_presign_multipart_parts?).to be true
    expect(p.complete_multipart_upload?).to be true
    expect(p.abort_multipart_upload?).to be true

    anon = policy(nil)
    expect(anon.upload?).to be false
    expect(anon.create_multipart_upload?).to be false
    expect(anon.batch_presign_multipart_parts?).to be false
    expect(anon.complete_multipart_upload?).to be false
    expect(anon.abort_multipart_upload?).to be false
  end
end

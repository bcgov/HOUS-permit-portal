require "rails_helper"

RSpec.describe ExplainerDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:explainer) { create(:explainer) }
  let(:record) { explainer.documents.create!(file: TestData.cached_file_data) }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits super admins to download draft files" do
    expect(policy(create(:user, :super_admin), record).download?).to be true
    expect(policy(create(:user), record).download?).to be false
  end

  it "permits download when the explainer is published" do
    published = create(:explainer, :published)
    document = published.documents.create!(file: TestData.cached_file_data)

    expect(policy(create(:user), document).download?).to be true
  end
end

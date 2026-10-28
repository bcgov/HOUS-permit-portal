require "rails_helper"

RSpec.describe ExplainerPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:template) { create(:requirement_template) }
  let(:record) do
    create(:explainer, :published, requirement_template: template)
  end

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "allows anyone to read a published explainer" do
    expect(policy(nil).show?).to be true
    expect(policy(create(:user)).show?).to be true
  end

  it "hides draft explainers from anonymous visitors" do
    record.update!(published_at: nil, introduction_html: "<p>Draft</p>")

    expect(policy(nil).show?).to be false
    expect(policy(create(:user, :super_admin)).show?).to be true
    expect(policy(create(:user, :review_manager)).show?).to be true
  end
end

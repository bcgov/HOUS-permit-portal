require "rails_helper"

RSpec.describe PermitApplicationPolicy do
  subject { described_class.new(user, draft_permit_application) }

  let(:resolved_scope) { described_class::Scope.new(user, PermitApplication.all).resolve }

  let(:user) { FactoryBot.create(:user) }
  let(:submitter) { FactoryBot.create(:user, :submitter) }
  let(:jurisdiction) { FactoryBot.create(:jurisdiction) }
  let(:draft_permit_application) do
    FactoryBot.create(:permit_application, submitter: submitter, jurisdiction: jurisdiction)
  end

  context "for a submitter" do
    let(:user) { submitter }

    it "permits index" do
      expect(subject.index?).to be true
    end

    it "permits show" do
      expect(subject.show?).to be true
    end

    it "permits search on own application" do
      expect(subject.search_permit_applications?).to be true
    end

    it "permits create" do
      expect(subject.create?).to be true
    end

    it "permits update" do
      expect(subject.update?).to be true
    end

    it "permits submit" do
      expect(subject.submit?).to be true
    end

    it "only includes own permit applications in scope" do
      other_user_application = FactoryBot.create(:permit_application)
      expect(resolved_scope).to include(draft_permit_application)
      expect(resolved_scope).not_to include(other_user_application)
    end
  end

  context "for a review manager with correct jurisdiction" do
    let(:user) { FactoryBot.create(:user, :review_manager, jurisdiction_id: jurisdiction.id) }

    it "permits search" do
      expect(subject.search_permit_applications?).to be true
    end
  end

  context "for a super admin" do
    let(:user) { FactoryBot.create(:user, :super_admin) }

    it "permits search" do
      expect(subject.search_permit_applications?).to be true
    end
  end

  context "for a submitter with a submitted permit application" do
    let(:user) { submitter }

    let(:submitted_permit_application) do
      FactoryBot.create(:permit_application, submitter: submitter, status: :submitted)
    end

    subject { described_class.new(submitter, submitted_permit_application) }

    it "does not permit update" do
      expect(subject.update?).to be false
    end
  end
end

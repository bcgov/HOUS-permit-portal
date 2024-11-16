require "rails_helper"

RSpec.describe PermitApplicationPolicy do
  let(:sandbox) { FactoryBot.create(:sandbox) }

  subject do
    described_class.new(
      UserContext.new(user, sandbox),
      draft_permit_application
    )
  end

  let(:resolved_scope) do
    described_class::Scope.new(
      UserContext.new(user, sandbox),
      PermitApplication.all
    ).resolve
  end

  let(:user) { FactoryBot.create(:user) }
  let(:submitter) { FactoryBot.create(:user, :submitter) }
  let(:jurisdiction) { FactoryBot.create(:sub_district) }
  let(:draft_permit_application) do
    FactoryBot.create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  context "for a submitter" do
    let(:user) { submitter }

    it "permits show" do
      expect(subject.show?).to be true
    end

    it "permits search on own application" do
      expect(subject.index?).to be true
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
    let(:user) { FactoryBot.create(:user, :review_manager, jurisdiction:) }

    it "Does not permit search on draft" do
      expect(subject.index?).to be false
    end
  end

  context "for a super admin" do
    let(:user) { FactoryBot.create(:user, :super_admin) }

    it "permits search" do
      expect(subject.index?).to be true
    end
  end

  context "for a submitter with a submitted permit application" do
    let(:user) { submitter }
    let(:sandbox) { FactoryBot.create(:sandbox) }
    let(:submitted_permit_application) do
      FactoryBot.create(
        :permit_application,
        :newly_submitted,
        submitter: submitter
      )
    end

    subject do
      described_class.new(
        UserContext.new(user, sandbox),
        submitted_permit_application
      )
    end

    it "does not permit update" do
      expect(subject.update?).to be false
    end
  end
end

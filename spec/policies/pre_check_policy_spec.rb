require "rails_helper"

RSpec.describe PreCheckPolicy do
  subject(:policy) { described_class }

  let(:creator) { create(:user) }
  let(:other_user) { create(:user) }
  let(:permit_application) { create(:permit_application, submitter: creator) }
  let(:pre_check) do
    create(:pre_check, creator: creator, permit_application: permit_application)
  end
  let(:creator_context) { UserContext.new(creator, nil) }
  let(:other_user_context) { UserContext.new(other_user, nil) }

  permissions :show? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, pre_check)
    end

    it "allows the permit application submitter" do
      expect(policy).to permit(
        creator_context,
        create(:pre_check, permit_application: permit_application)
      )
    end

    it "denies other users" do
      expect(policy).not_to permit(other_user_context, pre_check)
    end
  end

  permissions :create? do
    it "allows any authenticated user" do
      expect(policy).to permit(
        UserContext.new(create(:user), nil),
        build(:pre_check)
      )
    end
  end

  permissions :update? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, pre_check)
    end

    it "denies other users" do
      expect(policy).not_to permit(other_user_context, pre_check)
    end
  end

  permissions :index? do
    it "allows authenticated users" do
      expect(policy).to permit(UserContext.new(create(:user), nil), pre_check)
    end
  end

  describe PreCheckPolicy::Scope do
    it "returns only pre-checks created by the user" do
      mine = create(:pre_check, creator: creator)
      _theirs = create(:pre_check, creator: other_user)

      scope = described_class.new(creator_context, PreCheck.all).resolve

      expect(scope).to contain_exactly(mine)
    end
  end
end

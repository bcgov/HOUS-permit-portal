require "rails_helper"

RSpec.describe PreCheckPolicy do
  subject(:policy) { described_class }

  let(:creator) { create(:user) }
  let(:other_user) { create(:user) }
  let(:pre_check) { create(:pre_check, creator: creator) }
  let(:creator_context) { UserContext.new(creator, nil) }
  let(:other_user_context) { UserContext.new(other_user, nil) }

  permissions :show? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, pre_check)
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
      user = create(:user)
      pre_check = create(:pre_check, creator: user)

      expect(policy).to permit(UserContext.new(user, nil), pre_check)
    end
  end

  describe PreCheckPolicy::Scope do
    it "returns only pre-checks created by the user" do
      mine = create(:pre_check, creator: creator)
      _theirs = create(:pre_check, creator: other_user)

      scope = described_class.new(creator_context, PreCheck.all).resolve

      expect(scope).to contain_exactly(mine)
    end

    it "excludes standalone pre-checks from another sandbox" do
      jurisdiction = create(:sub_district)
      sandbox = jurisdiction.sandboxes.published.first
      other = jurisdiction.sandboxes.scheduled.first
      visible =
        create(
          :pre_check,
          creator: creator,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )
      hidden =
        create(
          :pre_check,
          creator: creator,
          jurisdiction: jurisdiction,
          sandbox: other
        )

      scope =
        described_class.new(
          UserContext.new(creator, sandbox),
          PreCheck.all
        ).resolve

      expect(scope).to include(visible)
      expect(scope).not_to include(hidden)
    end
  end
end

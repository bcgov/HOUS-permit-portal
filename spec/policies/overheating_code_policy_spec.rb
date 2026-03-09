require "rails_helper"

RSpec.describe OverheatingCodePolicy do
  subject(:policy) { described_class }

  let(:creator) { create(:user) }
  let(:other_user) { create(:user) }
  let(:overheating_code) { create(:overheating_code, creator: creator) }
  let(:creator_context) { UserContext.new(creator, nil) }
  let(:other_user_context) { UserContext.new(other_user, nil) }

  permissions :show? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, overheating_code)
    end

    it "denies other users" do
      expect(policy).not_to permit(other_user_context, overheating_code)
    end
  end

  permissions :create? do
    it "allows any authenticated user" do
      expect(policy).to permit(
        UserContext.new(create(:user), nil),
        build(:overheating_code)
      )
    end
  end

  permissions :update? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, overheating_code)
    end

    it "denies other users" do
      expect(policy).not_to permit(other_user_context, overheating_code)
    end
  end

  permissions :destroy? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, overheating_code)
    end

    it "denies other users" do
      expect(policy).not_to permit(other_user_context, overheating_code)
    end
  end

  permissions :restore? do
    it "allows the creator" do
      expect(policy).to permit(creator_context, overheating_code)
    end

    it "denies other users" do
      expect(policy).not_to permit(other_user_context, overheating_code)
    end
  end

  permissions :index? do
    it "allows authenticated users" do
      expect(policy).to permit(creator_context, overheating_code)
    end
  end

  describe OverheatingCodePolicy::Scope do
    it "returns only overheating codes created by the user" do
      mine = create(:overheating_code, creator: creator)
      _theirs = create(:overheating_code, creator: other_user)

      scope = described_class.new(creator_context, OverheatingCode.all).resolve

      expect(scope).to contain_exactly(mine)
    end
  end
end

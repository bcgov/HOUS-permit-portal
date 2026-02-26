# spec/models/live_requirement_template_spec.rb
require "rails_helper"

RSpec.describe LiveRequirementTemplate, type: :model, search: true do
  describe "Validations" do
    subject { build(:live_requirement_template) }

    describe "#validate_nickname_uniqueness" do
      context "when creating a new LiveRequirementTemplate with a unique nickname" do
        it "is valid" do
          expect(subject).to be_valid
        end
      end

      context "when creating a new LiveRequirementTemplate with a duplicate nickname" do
        let!(:existing_template) do
          create(
            :live_requirement_template,
            nickname: "Duplicate Nickname",
            discarded_at: nil
          )
        end

        let(:duplicate_template) do
          build(
            :live_requirement_template,
            nickname: "Duplicate Nickname",
            discarded_at: nil
          )
        end

        it "is invalid" do
          expect(duplicate_template).not_to be_valid
          expect(duplicate_template.errors[:nickname]).to be_present
        end
      end

      context "when creating a new LiveRequirementTemplate with the same nickname but the existing record is discarded" do
        before do
          create(
            :live_requirement_template,
            nickname: subject.nickname,
            discarded_at: Time.current
          )
        end

        it "is valid" do
          expect(subject).to be_valid
        end
      end
    end
  end

  describe "#visibility" do
    it "returns 'live'" do
      template = build(:live_requirement_template)
      expect(template.visibility).to eq("live")
    end
  end
end

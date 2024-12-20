# spec/models/live_requirement_template_spec.rb
require "rails_helper"

RSpec.describe LiveRequirementTemplate, type: :model do
  describe "Validations" do
    subject { build(:live_requirement_template) }

    describe "#unique_classification_for_undiscarded" do
      context "when creating a new LiveRequirementTemplate with a unique classification" do
        it "is valid" do
          expect(subject).to be_valid
        end
      end

      context "when creating a new LiveRequirementTemplate with a duplicate classification" do
        # Step 1: Create an existing record that will cause the subject to be invalid
        let!(:existing_template) do
          create(
            :live_requirement_template,
            permit_type: subject.permit_type,
            activity: subject.activity,
            first_nations: subject.first_nations,
            discarded_at: nil
          )
        end

        # Step 2: Build a duplicate record without saving
        let(:duplicate_template) do
          build(
            :live_requirement_template,
            permit_type: existing_template.permit_type,
            activity: existing_template.activity,
            first_nations: existing_template.first_nations,
            discarded_at: existing_template.discarded_at
          )
        end

        it "is invalid" do
          # Step 3: Trigger validations
          expect(duplicate_template).not_to be_valid
          expect(duplicate_template.errors[:base]).to include(
            I18n.t(
              "activerecord.errors.models.requirement_template.nonunique_classification"
            )
          )
        end
      end

      context "when creating a new LiveRequirementTemplate with a duplicate classification but the existing record is discarded" do
        before do
          create(
            :live_requirement_template,
            permit_type: subject.permit_type,
            activity: subject.activity,
            first_nations: subject.first_nations,
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

  describe "Scopes and Class Methods" do
    # Add any tests related to scopes or class methods if applicable
  end

  describe "Associations" do
    # Ensure associations are correctly set up
    it { should belong_to(:permit_type).class_name("PermitType") }
    it { should belong_to(:activity).class_name("Activity") }
    # Add more association tests as needed
  end
end

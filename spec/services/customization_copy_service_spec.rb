# spec/services/customization_copy_service_spec.rb
require "rails_helper"

RSpec.describe CustomizationCopyService, type: :service do
  include TestConstants

  let(:from_template_version) { create(:template_version) }
  let(:to_template_version) { create(:template_version) }
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { nil }

  subject do
    described_class.new(
      from_template_version,
      to_template_version,
      jurisdiction,
      sandbox
    )
  end

  describe "#merge_copy_customizations" do
    let(:include_electives) { false }
    let(:include_tips) { false }

    before do
      # Create a customization for the from_template_version
      create(
        :jurisdiction_template_version_customization,
        template_version: from_template_version,
        jurisdiction: jurisdiction,
        sandbox: sandbox,
        customizations_data:
          build_requirement_block_changes(
            include_electives: include_electives,
            include_tips: include_tips
          )
      )
    end

    context "when merging without electives and tips" do
      it "copies the requirement_block_changes correctly" do
        copied_customization =
          subject.merge_copy_customizations(include_electives, include_tips)

        expect(copied_customization).to be_persisted
        expect(copied_customization.customizations).to eq(
          {
            "requirement_block_changes" =>
              build_requirement_block_changes(
                include_electives: false,
                include_tips: false
              )
          }
        )
      end
    end

    # Other contexts...
  end
end

require "rails_helper"

RSpec.describe JurisdictionTemplateVersionCustomization, type: :model do
  let(:requirement) { create(:requirement, elective: true) }
  let(:jurisdiction) { create(:sub_district) }
  let(:published_template_version) do
    create(:template_version, status: "published")
  end
  let(:scheduled_template_version) do
    create(:template_version, status: "scheduled")
  end
  describe "#count_of_jurisdictions_using_requirement" do
    context "when no customizations reference the requirement" do
      it "returns 0 for published templates" do
        create(
          :jurisdiction_template_version_customization,
          jurisdiction: jurisdiction,
          template_version: published_template_version
        )
        expect(
          JurisdictionTemplateVersionCustomization.count_of_jurisdictions_using_requirement(
            requirement.requirement_block_id,
            requirement.id
          )
        ).to eq(0)
      end

      it "returns 0 for scheduled templates" do
        create(
          :jurisdiction_template_version_customization,
          jurisdiction: jurisdiction,
          template_version: scheduled_template_version
        )
        expect(
          JurisdictionTemplateVersionCustomization.count_of_jurisdictions_using_requirement(
            requirement.requirement_block_id,
            requirement.id
          )
        ).to eq(0)
      end
    end

    context "when customizations reference the requirement" do
      before do
        create(
          :jurisdiction_template_version_customization,
          customizations: {
            "requirement_block_changes" => {
              requirement.requirement_block_id.to_s => {
                "enabled_elective_field_ids" => [requirement.id.to_s]
              }
            }
          },
          jurisdiction: jurisdiction,
          template_version: published_template_version
        )

        create(
          :jurisdiction_template_version_customization,
          customizations: {
            "requirement_block_changes" => {
              requirement.requirement_block_id.to_s => {
                "enabled_elective_field_ids" => [requirement.id.to_s]
              }
            }
          },
          jurisdiction: jurisdiction,
          template_version: scheduled_template_version
        )
      end

      it "counts only customizations linked to published templates" do
        expect(
          JurisdictionTemplateVersionCustomization.count_of_jurisdictions_using_requirement(
            requirement.requirement_block_id,
            requirement.id
          )
        ).to eq(1)
      end
    end
  end

  describe "Callbacks" do
    describe "#sanitize_tip" do
      let(:customization) do
        build(
          :jurisdiction_template_version_customization,
          customizations: {
            "requirement_block_changes" => {
              "some_id" => {
                "tip" => "<script>alert('xss');</script>Tip content"
              }
            }
          },
          jurisdiction: jurisdiction,
          template_version: published_template_version
        )
      end

      it "sanitizes tip fields within customizations" do
        customization.save
        expect(
          customization.customizations["requirement_block_changes"]["some_id"][
            "tip"
          ]
        ).to eq("alert('xss');Tip content")
      end
    end
  end

  describe "Validations" do
    describe "uniqueness" do
      subject do
        create(
          :jurisdiction_template_version_customization,
          jurisdiction: jurisdiction,
          template_version: published_template_version
        )
      end
      let(:duplicate) do
        build(
          :jurisdiction_template_version_customization,
          jurisdiction: subject.jurisdiction,
          template_version: subject.template_version
        )
      end

      it "does not allow duplicate jurisdiction and template_version combinations" do
        expect(subject).to be_valid
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:template_version_id]).to include(
          "has already been taken"
        )
      end
    end
  end

  describe "Custom Validations" do
    describe "#ensure_reason_set_for_enabled_elective_fields" do
      context "when reasons are missing or incorrect" do
        let(:customization) do
          build(
            :jurisdiction_template_version_customization,
            customizations: {
              "requirement_block_changes" => {
                "some_id" => {
                  "enabled_elective_field_ids" => ["field_id"],
                  "enabled_elective_field_reasons" => {
                    "field_id" => "invalid_reason"
                  }
                }
              }
            },
            jurisdiction: jurisdiction,
            template_version: published_template_version
          )
        end
      end

      context "when reasons are correct" do
        let(:customization) do
          build(
            :jurisdiction_template_version_customization,
            customizations: {
              "requirement_block_changes" => {
                "some_id" => {
                  "enabled_elective_field_ids" => ["field_id"],
                  "enabled_elective_field_reasons" => {
                    "field_id" => "bylaw"
                  }
                }
              }
            },
            jurisdiction: jurisdiction,
            template_version: published_template_version
          )
        end

        it "is valid" do
          expect(customization).to be_valid
        end
      end
    end
  end

  describe "Count by reason" do
    context "when electives are enabled with reasons" do
      let!(:bylaw_customization) do
        create(
          :jurisdiction_template_version_customization,
          customizations: {
            "requirement_block_changes" => {
              requirement.requirement_block_id.to_s => {
                "enabled_elective_field_ids" => [requirement.id.to_s],
                "enabled_elective_field_reasons" => {
                  requirement.id.to_s => "bylaw"
                }
              }
            }
          },
          template_version: published_template_version,
          jurisdiction: jurisdiction
        )
      end

      let!(:policy_customization) do
        create(
          :jurisdiction_template_version_customization,
          customizations: {
            "requirement_block_changes" => {
              requirement.requirement_block_id.to_s => {
                "enabled_elective_field_ids" => [requirement.id.to_s],
                "enabled_elective_field_reasons" => {
                  requirement.id.to_s => "policy"
                }
              }
            }
          },
          template_version: scheduled_template_version,
          jurisdiction: jurisdiction
        )
      end

      it "counts only occurrences with the specified reason and published template version" do
        expect(
          JurisdictionTemplateVersionCustomization.requirement_count_by_reason(
            requirement.requirement_block_id,
            requirement.id,
            "bylaw"
          )
        ).to eq(1)
        expect(
          JurisdictionTemplateVersionCustomization.requirement_count_by_reason(
            requirement.requirement_block_id,
            requirement.id,
            "policy"
          )
        ).to eq(0) # Because template version is unpublished
        expect(
          JurisdictionTemplateVersionCustomization.requirement_count_by_reason(
            requirement.requirement_block_id,
            requirement.id,
            "zoning"
          )
        ).to eq(0)
      end
    end
  end
end

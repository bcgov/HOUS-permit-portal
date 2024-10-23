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
    describe "uniqueness and presence" do
      let(:jurisdiction) { create(:sub_district) }
      let(:template_version) { create(:template_version) }
      let(:sandbox) { create(:sandbox, jurisdiction: jurisdiction) }
      context "when sandboxed is true" do
        it "allows one sandboxed customization per jurisdiction and template version" do
          customization =
            create(
              :jurisdiction_template_version_customization,
              jurisdiction: jurisdiction,
              template_version: template_version,
              sandbox: sandbox
            )
          expect(customization).to be_valid
        end

        it "does allow a second sandboxed customization for the same jurisdiction and template version" do
          create(
            :jurisdiction_template_version_customization,
            jurisdiction: jurisdiction,
            template_version: template_version,
            sandbox: sandbox
          )
          duplicate_customization =
            build(
              :jurisdiction_template_version_customization,
              jurisdiction: jurisdiction,
              template_version: template_version,
              sandbox: sandbox
            )
          expect(duplicate_customization).not_to be_valid
          expect(duplicate_customization.errors.full_messages).to include(
            "already exists for this jurisdiction and template version."
          )
        end
      end

      context "when sandbox is nil" do
        it "allows a non-sandboxed customization per jurisdiction and template version" do
          customization =
            create(
              :jurisdiction_template_version_customization,
              jurisdiction: jurisdiction,
              template_version: template_version
            )
          expect(customization).to be_valid
        end

        it "does not allow a second non-sandboxed customization for the same jurisdiction and template version" do
          create(
            :jurisdiction_template_version_customization,
            jurisdiction: jurisdiction,
            template_version: template_version
          )
          duplicate_customization =
            build(
              :jurisdiction_template_version_customization,
              jurisdiction: jurisdiction,
              template_version: template_version
            )
          expect(duplicate_customization).not_to be_valid
          expect(duplicate_customization.errors.full_messages).to include(
            "already exists for this jurisdiction and template version."
          )
        end
      end

      context "when sandboxed varies" do
        it "allows sandboxed and non-sandboxed customization for the same jurisdiction and template version" do
          sandboxed_customization =
            create(
              :jurisdiction_template_version_customization,
              jurisdiction: jurisdiction,
              template_version: template_version,
              sandbox: sandbox
            )
          expect(sandboxed_customization).to be_valid

          live_customization =
            create(
              :jurisdiction_template_version_customization,
              jurisdiction: jurisdiction,
              template_version: template_version
            )
          expect(live_customization).to be_valid
        end
      end

      describe "presence" do
        it "is invalid without a jurisdiction" do
          customization =
            build(
              :jurisdiction_template_version_customization,
              jurisdiction: nil
            )
          expect(customization).not_to be_valid
          expect(customization.errors[:jurisdiction]).to include("must exist")
        end

        it "is invalid without a template_version" do
          customization =
            build(
              :jurisdiction_template_version_customization,
              template_version: nil
            )
          expect(customization).not_to be_valid
          expect(customization.errors[:template_version]).to include(
            "must exist"
          )
        end
      end
    end

    describe "Scopes" do
      let!(:sandbox) { create(:sandbox, jurisdiction: jurisdiction) }
      let!(:sandboxed_customization) do
        create(:jurisdiction_template_version_customization, sandbox: sandbox)
      end
      let!(:live_customization) do
        create(:jurisdiction_template_version_customization)
      end

      describe ".sandboxed" do
        it "returns only sandboxed customizations" do
          expect(JurisdictionTemplateVersionCustomization.sandboxed).to include(
            sandboxed_customization
          )
          expect(
            JurisdictionTemplateVersionCustomization.sandboxed
          ).not_to include(live_customization)
        end
      end

      describe ".live" do
        it "returns only non-sandboxed customizations" do
          expect(JurisdictionTemplateVersionCustomization.live).to include(
            live_customization
          )
          expect(JurisdictionTemplateVersionCustomization.live).not_to include(
            sandboxed_customization
          )
        end
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

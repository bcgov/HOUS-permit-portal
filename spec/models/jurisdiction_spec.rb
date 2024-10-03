require "rails_helper"

RSpec.describe Jurisdiction, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:permit_applications) }
    it { should have_many(:users).class_name("User") }

    # Testing has_many :through association
    it { should have_many(:submitters).through(:permit_applications).source(:submitter) }
  end

  describe "#create_integration_mappings after_save callback on new jurisdiction" do
    let!(:template_version_published) { create(:template_version, status: "published") }
    let!(:template_version_deprecated) do
      create(:template_version, status: "deprecated", deprecation_reason: "new_publish")
    end
    let!(:template_version_deprecated_other) do
      create(:template_version, status: "deprecated", deprecation_reason: "unscheduled", deprecated_by: create(:user))
    end

    context "when external_api_state is j_on" do
      let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
      it "creates mappings for published template versions" do
        expect(jurisdiction.integration_mappings.count).to eq(2)
        expect(jurisdiction.integration_mappings.pluck(:template_version_id)).to match_array(
          [template_version_published.id, template_version_deprecated.id],
        )
      end
    end

    context "when external_api_enabled is false" do
      let(:jurisdiction) { create(:sub_district) }

      it "does not create any mappings" do
        expect(jurisdiction.integration_mappings.count).to eq(0)
      end
    end
  end

  describe "#create_integration_mappings after_save callback on existing jurisdiction" do
    context "when external_api_enabled is changed to true" do
      let!(:jurisdiction) { create(:sub_district) }
      let!(:template_version_published) { create(:template_version, status: "published") }
      let!(:template_version_deprecated) do
        create(:template_version, status: "deprecated", deprecation_reason: "new_publish")
      end
      let!(:template_version_deprecated_other) do
        create(:template_version, status: "deprecated", deprecation_reason: "unscheduled", deprecated_by: create(:user))
      end
      let!(:user) { create(:user, :super_admin) }

      it "creates mappings for published template versions" do
        expect(jurisdiction.integration_mappings.count).to eq(0)

        jurisdiction.enable_external_api!(user)

        expect(jurisdiction.integration_mappings.count).to eq(2)
        expect(jurisdiction.integration_mappings.pluck(:template_version_id)).to match_array(
          [template_version_published.id, template_version_deprecated.id],
        )
      end
    end
  end

  describe "callbacks" do
    let(:super_admin) { create(:user, :super_admin) }
    let(:manager) { create(:user, :review_manager) }
    let(:jurisdiction) { create(:sub_district) }
    let(:enabled_jurisdiction) { create(:sub_district, external_api_state: "j_on") }
    describe "#create_integration_mappings_async" do
      context "when transitioning to j_on" do
        it "enqueues the job" do
          allow(Rails.env).to receive(:test?).and_return(false)
          expect(ModelCallbackJob).to receive(:perform_async).with(
            "SubDistrict",
            jurisdiction.id,
            "create_integration_mappings",
          )
          jurisdiction.enable_external_api!(super_admin)
        end

        it "performs the job immediately in test environment" do
          allow(Rails.env).to receive(:test?).and_return(true)
          job_instance = double("ModelCallbackJob")
          expect(ModelCallbackJob).to receive(:new).and_return(job_instance)
          expect(job_instance).to receive(:perform).with("SubDistrict", jurisdiction.id, "create_integration_mappings")
          jurisdiction.enable_external_api!(super_admin)
        end
      end

      context "when not transitioning to j_on" do
        it "does not enqueue the job" do
          allow(Rails.env).to receive(:test?).and_return(false)
          expect(ModelCallbackJob).to receive(:new).at_most(:once)
          enabled_jurisdiction.disable_external_api!(manager)
        end
      end
    end
  end
end

require "rails_helper"

RSpec.describe Jurisdiction, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:permit_applications) }
    it { should have_many(:users).class_name("User") }

    # Testing has_many :through association
    it do
      should have_many(:submitters).through(:permit_applications).source(
               :submitter
             )
    end
  end

  describe "#create_integration_mappings after_save callback on new jurisdiction" do
    let!(:template_version_published) do
      create(:template_version, status: "published")
    end
    let!(:template_version_deprecated) do
      create(
        :template_version,
        status: "deprecated",
        deprecation_reason: "new_publish"
      )
    end
    let!(:template_version_deprecated_other) do
      create(
        :template_version,
        status: "deprecated",
        deprecation_reason: "unscheduled",
        deprecated_by: create(:user)
      )
    end

    context "when external_api_state is j_on" do
      let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
      it "creates mappings for published template versions" do
        expect(jurisdiction.integration_mappings.count).to eq(2)
        expect(
          jurisdiction.integration_mappings.pluck(:template_version_id)
        ).to match_array(
          [template_version_published.id, template_version_deprecated.id]
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
      let!(:template_version_published) do
        create(:template_version, status: "published")
      end
      let!(:template_version_deprecated) do
        create(
          :template_version,
          status: "deprecated",
          deprecation_reason: "new_publish"
        )
      end
      let!(:template_version_deprecated_other) do
        create(
          :template_version,
          status: "deprecated",
          deprecation_reason: "unscheduled",
          deprecated_by: create(:user)
        )
      end
      let!(:user) { create(:user, :super_admin) }

      it "creates mappings for published template versions" do
        expect(jurisdiction.integration_mappings.count).to eq(0)

        jurisdiction.update_external_api_state!(
          enable_external_api: true,
          allow_reset: user.super_admin?
        )

        expect(jurisdiction.integration_mappings.count).to eq(2)
        expect(
          jurisdiction.integration_mappings.pluck(:template_version_id)
        ).to match_array(
          [template_version_published.id, template_version_deprecated.id]
        )
      end
    end
  end
  describe "validations" do
    context "when there is at least one sandbox" do
      it "is valid" do
        jurisdiction =
          Jurisdiction.new(name: "Townsville", locality_type: "city")
        expect(jurisdiction).to be_valid
        expect(jurisdiction.sandboxes.size).to eq(2)
      end

      it "allows sandboxes with unique scopes within the same jurisdiction" do
        jurisdiction =
          create(:sub_district, name: "Townsville", locality_type: "city")

        expect(jurisdiction).to be_valid
        expect(jurisdiction.sandboxes.size).to eq(2)
        expect(
          jurisdiction.sandboxes.pluck(:template_version_status_scope)
        ).to match_array(%w[published scheduled])
      end
    end

    describe "office_email and office_telephone" do
      let(:jurisdiction) { create(:sub_district) }

      it "allows blank office_email and office_telephone" do
        jurisdiction.assign_attributes(office_email: "", office_telephone: "")
        expect(jurisdiction).to be_valid
      end

      it "rejects invalid office_email format" do
        jurisdiction.office_email = "not-an-email"
        expect(jurisdiction).not_to be_valid
        expect(jurisdiction.errors[:office_email]).to be_present
      end

      it "accepts valid office_email" do
        jurisdiction.office_email = "valid@example.com"
        expect(jurisdiction).to be_valid
      end

      it "rejects invalid office_telephone" do
        jurisdiction.office_telephone = "invalid_phone"
        expect(jurisdiction).not_to be_valid
        expect(jurisdiction.errors[:office_telephone]).to be_present
      end

      it "accepts valid office_telephone" do
        jurisdiction.office_telephone = "+16045551234"
        expect(jurisdiction).to be_valid
      end
    end

    describe "project meeting notification recipient emails" do
      let(:jurisdiction) { create(:sub_district) }

      it "returns confirmed project meeting contact emails" do
        create(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          email: "meetings@example.com"
        )
        create(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          email: "unconfirmed@example.com",
          confirmed_at: nil
        )
        create(
          :submission_contact,
          jurisdiction: jurisdiction,
          email: "submission@example.com"
        )

        expect(
          jurisdiction.project_meeting_notification_recipient_emails
        ).to eq(["meetings@example.com"])
      end

      it "exposes confirmed project meeting contacts" do
        contact =
          create(:meeting_submission_contact, jurisdiction: jurisdiction)

        expect(jurisdiction.confirmed_project_meeting_contacts).to eq([contact])
      end
    end

    describe "property information notification recipient emails" do
      let(:jurisdiction) { create(:sub_district) }

      it "returns confirmed property information contact emails" do
        create(
          :property_information_submission_contact,
          jurisdiction: jurisdiction,
          email: "property-info@example.com"
        )
        create(
          :property_information_submission_contact,
          jurisdiction: jurisdiction,
          email: "unconfirmed@example.com",
          confirmed_at: nil
        )
        create(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          email: "meetings@example.com"
        )

        expect(
          jurisdiction.property_information_notification_recipient_emails
        ).to eq(["property-info@example.com"])
      end

      it "exposes confirmed property information contacts" do
        contact =
          create(
            :property_information_submission_contact,
            jurisdiction: jurisdiction
          )

        expect(jurisdiction.confirmed_property_information_contacts).to eq(
          [contact]
        )
      end
    end

    describe "feature setup requirements" do
      let(:jurisdiction) { create(:sub_district) }

      it "requires a confirmed project meeting contact before enabling project meetings" do
        create(
          :resource,
          jurisdiction: jurisdiction,
          category: :project_meeting_authorization
        )
        jurisdiction.project_meetings_enabled = true

        expect(jurisdiction).not_to be_valid
        expect(jurisdiction.errors[:project_meetings_enabled]).to include(
          I18n.t(
            "activerecord.errors.models.jurisdiction.enabled_project_meetings_requires_setup"
          )
        )
      end

      it "requires a project meeting authorization resource before enabling project meetings" do
        create(:meeting_submission_contact, jurisdiction: jurisdiction)
        jurisdiction.project_meetings_enabled = true

        expect(jurisdiction).not_to be_valid
        expect(jurisdiction.errors[:project_meetings_enabled]).to include(
          I18n.t(
            "activerecord.errors.models.jurisdiction.enabled_project_meetings_requires_authorization_resource"
          )
        )
      end

      it "allows project meetings to be enabled with a confirmed contact and authorization resource" do
        create(:meeting_submission_contact, jurisdiction: jurisdiction)
        create(
          :resource,
          jurisdiction: jurisdiction,
          category: :project_meeting_authorization
        )

        jurisdiction.project_meetings_enabled = true

        expect(jurisdiction).to be_valid
      end

      it "requires a confirmed property information contact before enabling property information requests" do
        jurisdiction.property_information_requests_enabled = true

        expect(jurisdiction).not_to be_valid
        expect(
          jurisdiction.errors[:property_information_requests_enabled]
        ).to include(
          I18n.t(
            "activerecord.errors.models.jurisdiction.enabled_property_information_requests_requires_setup"
          )
        )
      end

      it "allows property information requests to be enabled with a confirmed property information contact" do
        create(
          :property_information_submission_contact,
          jurisdiction: jurisdiction
        )

        jurisdiction.property_information_requests_enabled = true

        expect(jurisdiction).to be_valid
      end
    end

    describe "submission contact deletion" do
      let(:jurisdiction) { create(:sub_district) }

      it "prevents deleting the last confirmed contact through nested attributes when its feature is enabled" do
        contact =
          create(:meeting_submission_contact, jurisdiction: jurisdiction)
        create(
          :resource,
          jurisdiction: jurisdiction,
          category: :project_meeting_authorization
        )
        jurisdiction.update!(project_meetings_enabled: true)

        expect {
          jurisdiction.update(
            submission_contacts_attributes: [
              {
                id: contact.id,
                type: "MeetingSubmissionContact",
                _destroy: true
              }
            ]
          )
        }.to raise_error(ActiveRecord::RecordNotDestroyed)

        expect(MeetingSubmissionContact.exists?(contact.id)).to be(true)
      end
    end
  end

  describe "#should_index?" do
    it "excludes hidden jurisdictions from the Searchkick index" do
      jurisdiction = build(:sub_district, hide_from_search: true)

      expect(jurisdiction.should_index?).to be(false)
    end
  end

  describe "callbacks" do
    let(:super_admin) { create(:user, :super_admin) }
    let(:manager) { create(:user, :review_manager) }
    let(:jurisdiction) { create(:sub_district) }
    let(:enabled_jurisdiction) do
      create(:sub_district, external_api_state: "j_on")
    end

    describe "before validation" do
      it "builds two sandboxes if none exist" do
        jurisdiction =
          Jurisdiction.new(name: "Townsville", locality_type: "city")
        expect { jurisdiction.valid? }.to change {
          jurisdiction.sandboxes.size
        }.from(0).to(2)
        expect(jurisdiction.sandboxes.first).to be_a_new(Sandbox)
        expect(jurisdiction.sandboxes.second).to be_a_new(Sandbox)
      end
    end

    describe "#create_integration_mappings_async" do
      context "when transitioning to j_on" do
        it "enqueues the job" do
          allow(Rails.env).to receive(:test?).and_return(false)
          expect(ModelCallbackJob).to receive(:perform_async).with(
            "SubDistrict",
            jurisdiction.id,
            "create_integration_mappings"
          )
          jurisdiction.update_external_api_state!(
            enable_external_api: true,
            allow_reset: super_admin.super_admin?
          )
        end

        it "performs the job immediately in test environment" do
          allow(Rails.env).to receive(:test?).and_return(true)
          job_instance = double("ModelCallbackJob")
          expect(ModelCallbackJob).to receive(:new).and_return(job_instance)
          expect(job_instance).to receive(:perform).with(
            "SubDistrict",
            jurisdiction.id,
            "create_integration_mappings"
          )

          jurisdiction.update_external_api_state!(
            enable_external_api: true,
            allow_reset: super_admin.super_admin?
          )
        end
      end

      context "when not transitioning to j_on" do
        it "does not enqueue the job" do
          allow(Rails.env).to receive(:test?).and_return(false)
          expect(ModelCallbackJob).to receive(:new).at_most(:once)

          jurisdiction.update_external_api_state!(
            enable_external_api: false,
            allow_reset: manager.super_admin?
          )
        end
      end
    end
  end

  describe "#submission_inbox_set_up?" do
    let(:jurisdiction) { create(:sub_district) }

    it "returns a boolean" do
      expect([true, false]).to include(jurisdiction.submission_inbox_set_up?)
    end
  end

  describe "step requirements updated_at" do
    let(:jurisdiction) { create(:sub_district) }

    describe "#part_9_step_requirements_updated_at" do
      it "is nil when only an untouched auto-created default exists" do
        expect(jurisdiction.jurisdiction_step_requirements.count).to eq(1)
        expect(jurisdiction.part_9_step_requirements_updated_at).to be_nil
      end

      it "returns the default's updated_at after an admin save" do
        default_step =
          jurisdiction.jurisdiction_step_requirements.find_by!(default: true)
        default_step.update_columns(updated_at: 2.days.ago)

        expect(
          jurisdiction.reload.part_9_step_requirements_updated_at
        ).to be_within(1.second).of(default_step.reload.updated_at)
      end

      it "returns the latest customization updated_at" do
        customization =
          jurisdiction.jurisdiction_step_requirements.create!(
            default: nil,
            energy_step_required: ENV["PART_9_MIN_ENERGY_STEP"].to_i,
            zero_carbon_step_required: ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i
          )
        customization.update_columns(updated_at: 3.days.ago)

        expect(
          jurisdiction.reload.part_9_step_requirements_updated_at
        ).to be_within(1.second).of(customization.reload.updated_at)
      end
    end

    describe "#part_3_step_requirements_updated_at" do
      it "is nil when no Part 3 occupancy steps exist" do
        expect(jurisdiction.part_3_step_requirements_updated_at).to be_nil
      end

      it "returns the latest Part 3 occupancy step updated_at" do
        step =
          jurisdiction.part3_occupancy_required_steps.create!(
            occupancy_key: "offices",
            energy_step_required: 2,
            zero_carbon_step_required: 1
          )
        step.update_columns(updated_at: 4.days.ago)

        expect(
          jurisdiction.reload.part_3_step_requirements_updated_at
        ).to be_within(1.second).of(step.reload.updated_at)
      end
    end
  end

  describe "resources nested attributes" do
    it "updates show_on_about and about_position" do
      jurisdiction = create(:sub_district)
      resource = create(:resource, jurisdiction: jurisdiction)

      jurisdiction.update!(
        resources_attributes: [
          { id: resource.id, show_on_about: false, about_position: 4 }
        ]
      )

      resource.reload
      expect(resource.show_on_about).to be(false)
      expect(resource.about_position).to eq(4)
    end
  end
end

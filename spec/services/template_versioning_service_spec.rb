require "rails_helper"

RSpec.describe TemplateVersioningService, type: :service, search: true do
  let!(:requirement_template) do
    create(:live_full_requirement_template, sections_count: 3)
  end

  describe "schedule!" do
    context "when the version date is valid" do
      it "schedules a new template version for the future and there is no other scheduled versions before the new template version date" do
        version_date = Date.tomorrow
        template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            version_date
          )

        expect(template_version.version_date).to eq(version_date)
        expect(template_version.status).to eq("scheduled")
      end

      it "schedules a new template version for the future and and after last version" do
        version_date = Date.tomorrow
        template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            version_date
          )

        new_version_date = Date.tomorrow.tomorrow
        new_template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            new_version_date
          )

        expect(template_version.version_date).to eq(version_date)
        expect(template_version.status).to eq("scheduled")

        expect(new_template_version.version_date).to eq(new_version_date)
        expect(new_template_version.status).to eq("scheduled")
      end
    end

    context "when the version date is not valid" do
      it "raises an error when the template version is scheduled for in the past" do
        version_date = Date.yesterday

        expect {
          TemplateVersioningService.schedule!(
            requirement_template,
            version_date
          )
        }.to raise_error(
          TemplateVersionScheduleError,
          "Version date must be in the future and after latest scheduled version date"
        )
      end

      it "raises an error when a new template version is scheduled to be before an existing template version" do
        version_date = Date.tomorrow.tomorrow
        template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            version_date
          )

        expect {
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )
        }.to raise_error(
          TemplateVersionScheduleError,
          "Version date must be in the future and after latest scheduled version date"
        )
      end

      it "raises an error when a new template version is scheduled for the same day as an existing template version" do
        version_date = Date.tomorrow
        template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            version_date
          )

        expect {
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )
        }.to raise_error(
          TemplateVersionScheduleError,
          "Version date must be in the future and after latest scheduled version date"
        )
      end
    end

    context "state of the template" do
      let(:template_version) do
        version_date = Date.tomorrow
        TemplateVersioningService.schedule!(requirement_template, version_date)
      end

      it "saves the current requirement template state to denormalized_template_json" do
        expected_denormalized_template_json =
          RequirementTemplateBlueprint.render_as_json(
            requirement_template,
            view: :template_snapshot
          )

        expect(template_version.denormalized_template_json).to eq(
          expected_denormalized_template_json
        )
      end

      it "saves the current requirement template form_json to denormalized_template_json" do
        expected_form_json = requirement_template.to_form_json.as_json

        expect(template_version.form_json).to eq(expected_form_json)
      end

      it "saves the current requirement_blocks to requirement_blocks_json" do
        requirement_blocks_json = template_version.requirement_blocks_json

        requirement_template.requirement_template_sections.each do |section|
          section.template_section_blocks.each do |section_block|
            expect(
              requirement_blocks_json[section_block.requirement_block.id]
            ).to eq(
              RequirementBlockBlueprint.render_as_json(
                section_block.requirement_block,
                parent_key: section.key
              )
            )
          end
        end
      end
    end
  end

  describe "publish_version!" do
    context "when publish is invalid" do
      it "raises an error when trying to publish a version scheduled for the future" do
        template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )

        expect {
          TemplateVersioningService.publish_version!(template_version)
        }.to raise_error(
          TemplateVersionPublishError,
          "Version cannot be published before it's scheduled date"
        )
      end
    end

    context "when publish is valid" do
      it "sets the status to published" do
        version_date = Date.tomorrow
        template_version =
          TemplateVersioningService.schedule!(
            requirement_template,
            version_date
          )

        Timecop.freeze(version_date) do
          template_version =
            TemplateVersioningService.publish_version!(template_version)

          expect(template_version.status).to eq("published")
        end
      end

      it "sets all earlier versions to be deprecated and adds correct depreciation reason" do
        template_version_1 = nil
        template_version_2 = nil
        Timecop.freeze(Date.current - 3) do
          template_version_1 =
            TemplateVersioningService.schedule!(
              requirement_template,
              Date.current + 1
            )
          template_version_2 =
            TemplateVersioningService.schedule!(
              requirement_template,
              Date.current + 2
            )
        end

        template_version_3 =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )
        template_version_4 =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow + 1
          )

        template_versions_to_be_deprecated = [
          template_version_1,
          template_version_2
        ]

        Timecop.freeze(Date.tomorrow) do
          published_template_version_3 =
            TemplateVersioningService.publish_version!(template_version_3)

          expect(published_template_version_3.status).to eq("published")

          template_versions_to_be_deprecated.each do |template_version|
            template_version.reload

            expect(template_version.status).to eq("deprecated")
            expect(template_version.deprecation_reason).to eq("new_publish")
          end

          expect(template_version_4.status).to eq("scheduled")
        end
      end
    end
  end
  context "get_versions_publishable_now" do
    it "returns the latest publishable version per requirement template" do
      expected_publishable_version_1 = nil
      expected_publishable_version_2 = nil

      Timecop.freeze(Date.current - 10) do
        TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 1
        )
        TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 2
        )
        expected_publishable_version_1 =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.current + 5
          )
        TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 15
        )

        requirement_template_2 =
          create(:live_full_requirement_template, sections_count: 1)

        TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 3
        )
        TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 5
        )
        expected_publishable_version_2 =
          TemplateVersioningService.schedule!(
            requirement_template_2,
            Date.current + 7
          )

        TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 30
        )
      end

      publishable_versions =
        TemplateVersioningService.get_versions_publishable_now

      expect(publishable_versions.length).to eq(2)
      expect(publishable_versions).to include(
        expected_publishable_version_1,
        expected_publishable_version_2
      )
    end
  end

  describe "promote_draft_to_scheduled!" do
    let(:super_admin) { create(:user, :super_admin) }
    let(:draft_version) do
      TemplateVersioningService.create_draft!(requirement_template)
    end

    context "when the version date is valid" do
      it "promotes the draft to a scheduled version" do
        version_date = Date.tomorrow

        promoted =
          TemplateVersioningService.promote_draft_to_scheduled!(
            draft_version,
            version_date,
            current_user: super_admin
          )

        expect(promoted.id).to eq(draft_version.id)
        expect(promoted.status).to eq("scheduled")
        expect(promoted.version_date).to eq(version_date)
      end

      it "unschedules sibling scheduled versions on or before the incoming date" do
        earlier_scheduled =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )

        TemplateVersioningService.promote_draft_to_scheduled!(
          draft_version,
          Date.tomorrow + 3,
          current_user: super_admin
        )

        earlier_scheduled.reload
        expect(earlier_scheduled.status).to eq("deprecated")
        expect(earlier_scheduled.deprecation_reason).to eq("unscheduled")
        expect(earlier_scheduled.deprecated_by_id).to eq(super_admin.id)
      end

      it "leaves scheduled versions with later dates untouched" do
        later_scheduled =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow + 10
          )

        TemplateVersioningService.promote_draft_to_scheduled!(
          draft_version,
          Date.tomorrow,
          current_user: super_admin
        )

        later_scheduled.reload
        expect(later_scheduled.status).to eq("scheduled")
      end
    end

    context "when the version date is invalid" do
      it "raises TemplateVersionScheduleError for past dates" do
        expect {
          TemplateVersioningService.promote_draft_to_scheduled!(
            draft_version,
            Date.yesterday,
            current_user: super_admin
          )
        }.to raise_error(TemplateVersionScheduleError)
      end

      it "raises TemplateVersionScheduleError for today" do
        expect {
          TemplateVersioningService.promote_draft_to_scheduled!(
            draft_version,
            Date.current,
            current_user: super_admin
          )
        }.to raise_error(TemplateVersionScheduleError)
      end
    end

    context "when the template version is not a draft" do
      it "raises TemplateVersionDraftError" do
        scheduled =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )

        expect {
          TemplateVersioningService.promote_draft_to_scheduled!(
            scheduled,
            Date.tomorrow + 5,
            current_user: super_admin
          )
        }.to raise_error(
          TemplateVersionDraftError,
          /Can only promote a draft version/
        )
      end
    end

    context "skip_date_check (force publish)" do
      around do |example|
        original = ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"]
        ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] = env_flag
        example.run
      ensure
        ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] = original
      end

      context "when ENABLE_TEMPLATE_FORCE_PUBLISH is not set" do
        let(:env_flag) { "false" }

        it "raises TemplateVersionForcePublishNowError" do
          expect {
            TemplateVersioningService.promote_draft_to_scheduled!(
              draft_version,
              nil,
              skip_date_check: true,
              current_user: super_admin
            )
          }.to raise_error(TemplateVersionForcePublishNowError)
        end
      end

      context "when ENABLE_TEMPLATE_FORCE_PUBLISH is set" do
        let(:env_flag) { "true" }

        before do
          allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
        end

        it "publishes the draft inline with today's version_date" do
          promoted =
            TemplateVersioningService.promote_draft_to_scheduled!(
              draft_version,
              nil,
              skip_date_check: true,
              current_user: super_admin
            )

          expect(promoted.status).to eq("published")
          expect(promoted.version_date).to eq(Date.current)
        end

        it "deprecates any scheduled sibling with version_date on or before today via publish_version!" do
          earlier_scheduled =
            TemplateVersioningService.schedule!(
              requirement_template,
              Date.tomorrow
            )
          earlier_scheduled.update_columns(version_date: Date.current - 5)

          TemplateVersioningService.promote_draft_to_scheduled!(
            draft_version,
            nil,
            skip_date_check: true,
            current_user: super_admin
          )

          earlier_scheduled.reload
          expect(earlier_scheduled.status).to eq("deprecated")
        end

        it "pushes a websocket update to super admins" do
          TemplateVersioningService.promote_draft_to_scheduled!(
            draft_version,
            nil,
            skip_date_check: true,
            current_user: super_admin
          )

          expect(WebsocketBroadcaster).to have_received(
            :push_update_to_relevant_users
          )
        end
      end
    end
  end

  context "publish_versions_publishable_now!" do
    it "publishes latest version publishable now and deprecates all older versions with correct reason" do
      expected_published_versions = []
      expected_deprecated_versions = []
      expected_scheduled_versions = []

      Timecop.freeze(Date.current - 10) do
        expected_deprecated_versions << TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 1
        )
        expected_deprecated_versions << TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 2
        )
        expected_published_versions << TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 5
        )
        expected_scheduled_versions << TemplateVersioningService.schedule!(
          requirement_template,
          Date.current + 15
        )

        requirement_template_2 =
          create(:live_full_requirement_template, sections_count: 1)

        expected_deprecated_versions << TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 3
        )
        expected_deprecated_versions << TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 5
        )
        expected_published_versions << TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 7
        )
        expected_scheduled_versions << TemplateVersioningService.schedule!(
          requirement_template_2,
          Date.current + 30
        )
      end

      TemplateVersioningService.publish_versions_publishable_now!

      expected_published_versions.each do |expected_published_version|
        expected_published_version.reload

        expect(expected_published_version.status).to eq("published")
      end

      expected_deprecated_versions.each do |expected_deprecated_version|
        expected_deprecated_version.reload

        expect(expected_deprecated_version.status).to eq("deprecated")
        expect(expected_deprecated_version.deprecation_reason).to eq(
          "new_publish"
        )
      end

      expected_scheduled_versions.each do |expected_scheduled_version|
        expected_scheduled_version.reload

        expect(expected_scheduled_version.status).to eq("scheduled")
      end
    end
  end
end

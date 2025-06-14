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

        template_version.denormalized_template_json.should eq(
          expected_denormalized_template_json
        )
      end

      it "saves the current requirement template form_json to denormalized_template_json" do
        expected_form_json = requirement_template.to_form_json.as_json

        template_version.form_json.should eq(expected_form_json)
      end

      it "saves the current requirement_blocks to requirement_blocks_json" do
        requirement_blocks_json = template_version.requirement_blocks_json

        requirement_template.requirement_template_sections.each do |section|
          section.template_section_blocks.each do |section_block|
            requirement_blocks_json[
              section_block.requirement_block.id
            ].should eq(
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

        permit_type = create(:permit_type, code: :medium_residential)
        requirement_template_2 =
          create(
            :live_full_requirement_template,
            permit_type: permit_type,
            sections_count: 1
          )

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

        permit_type = create(:permit_type, code: :medium_residential)
        requirement_template_2 =
          create(
            :live_full_requirement_template,
            permit_type: permit_type,
            sections_count: 1
          )

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

  describe ".create_or_update_published_version_for_early_access!" do
    context "when the requirement_template is an EarlyAccessRequirementTemplate" do
      let(:early_access_template) do
        create(
          :early_access_requirement_template_with_sections,
          sections_count: 3
        )
      end

      context "and no published version exists" do
        it "creates a new published template version" do
          # The calling of the service should not affect the count because it is already called in model creation
          expect {
            TemplateVersioningService.create_or_update_published_version_for_early_access!(
              early_access_template
            )
          }.to change { early_access_template.template_versions.count }.by(0)

          published_version = early_access_template.published_template_version
          expect(published_version).not_to be_nil
          expect(published_version.status).to eq("published")
          expect(published_version.version_date).to eq(Date.current)
          rendered_hash =
            RequirementTemplateBlueprint.render_as_hash(
              early_access_template,
              view: :template_snapshot
            )
          rendered_hash["published_template_version"] = nil
          expect(published_version.denormalized_template_json).to eq(
            rendered_hash.deep_stringify_keys
          )
          expect(published_version.form_json).to eq(
            early_access_template.to_form_json
          )
          expect(published_version.requirement_blocks_json).to eq(
            TemplateVersioningService.send(
              :form_requirement_blocks_hash,
              early_access_template
            )
          )
        end
      end

      context "and a published version already exists" do
        let!(:existing_published_version) do
          TemplateVersioningService.create_or_update_published_version_for_early_access!(
            early_access_template
          )
        end

        it "updates the existing published template version" do
          # Modify the requirement_template to simulate changes
          # For example, add a new section or modify existing ones
          # Here, we'll assume adding a new section
          new_section =
            create(
              :requirement_template_section,
              requirement_template: early_access_template
            )

          expect {
            TemplateVersioningService.create_or_update_published_version_for_early_access!(
              early_access_template
            )
          }.not_to change { early_access_template.template_versions.count }

          existing_published_version =
            early_access_template.published_template_version
          expect(existing_published_version.status).to eq("published")
          expect(existing_published_version.version_date).to eq(Date.current)
          expect(existing_published_version.denormalized_template_json).to eq(
            RequirementTemplateBlueprint.render_as_hash(
              early_access_template,
              view: :template_snapshot
            ).deep_stringify_keys
          )
          expect(existing_published_version.form_json).to eq(
            early_access_template.to_form_json
          )
          expect(existing_published_version.requirement_blocks_json).to eq(
            TemplateVersioningService.send(
              :form_requirement_blocks_hash,
              early_access_template
            )
          )
        end
      end
    end

    context "when the requirement_template is not an EarlyAccessRequirementTemplate" do
      it "raises a TemplateVersionPublishError" do
        expect {
          TemplateVersioningService.create_or_update_published_version_for_early_access!(
            requirement_template
          )
        }.to raise_error(
          TemplateVersionPublishError,
          "Cannot create early access version for a non-early access requirement template"
        )
      end
    end
  end
end

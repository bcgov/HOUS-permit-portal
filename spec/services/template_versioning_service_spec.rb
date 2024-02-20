require "rails_helper"

RSpec.describe TemplateVersioningService, type: :service do
  let!(:requirement_template) { create(:full_requirement_template, sections_count: 3) }
  let!(:service) { TemplateVersioningService.new(requirement_template) }

  describe "schedule" do
    context "when the version date is valid" do
      it "schedules a new template version for the future and there is no other scheduled versions before the new template version date" do
        version_date = Date.tomorrow
        template_version = service.schedule!(version_date)

        expect(template_version.version_date).to eq(version_date)
        expect(template_version.status).to eq("scheduled")
      end

      it "schedules a new template version for the future and and after last version" do
        version_date = Date.tomorrow
        template_version = service.schedule!(version_date)

        new_version_date = Date.tomorrow.tomorrow
        new_template_version = service.schedule!(new_version_date)

        expect(template_version.version_date).to eq(version_date)
        expect(template_version.status).to eq("scheduled")

        expect(new_template_version.version_date).to eq(new_version_date)
        expect(new_template_version.status).to eq("scheduled")
      end
    end

    context "when the version date is not valid" do
      it "raises an error when the template version is scheduled for in the past" do
        version_date = Date.yesterday

        expect { service.schedule!(version_date) }.to raise_error(
          StandardError,
          "Version date must be in the future and after latest scheduled version date",
        )
      end

      it "raises an error when a new template version is scheduled to be before an existing template version" do
        version_date = Date.tomorrow.tomorrow
        template_version = service.schedule!(version_date)

        expect { service.schedule!(Date.tomorrow) }.to raise_error(
          StandardError,
          "Version date must be in the future and after latest scheduled version date",
        )
      end
    end

    context "state of the template" do
      let(:template_version) do
        version_date = Date.tomorrow
        service.schedule!(version_date)
      end

      it "saves the current requirement template state to denormalized_template_json" do
        expected_denormalized_template_json =
          RequirementTemplateBlueprint.render_as_json(requirement_template, view: :extended)

        template_version.denormalized_template_json.should eq(expected_denormalized_template_json)
      end

      it "saves the current requirement template form_json to denormalized_template_json" do
        expected_form_json = requirement_template.to_form_json.as_json

        template_version.form_json.should eq(expected_form_json)
      end

      it "saves the current requirement_blocks to requirement_blocks_json" do
        requirement_blocks_json = template_version.requirement_blocks_json

        requirement_template.requirement_template_sections.each do |section|
          section.template_section_blocks.each do |section_block|
            requirement_blocks_json[section_block.requirement_block.id].should eq(
                       RequirementBlockBlueprint.render_as_json(section_block.requirement_block),
                     )
          end
        end
      end
    end
  end
end

require "rails_helper"

RSpec.describe TemplateVersioningService, type: :service do
  let!(:requirement_template) { create(:requirement_template_with_sections, template_count: 3) }
  let!(:service) { TemplateVersioningService.new(requirement_template) }

  describe "schedule" do
    context "when the version date is valid" do
      it "schedules a new template version for the future and there is no other scheduled versions before the new template version date" do
        version_date = Date.tomorrow

        template_version = service.schedule(version_date)

        expect(template_version.version_date).to eq(version_date)
        expect(template_version.status).to eq("scheduled")
      end
    end

    context "when the version date is not valid" do
      it "raises an error when the template version is scheduled for in the past" do
        version_date = Date.yesterday

        expect { service.schedule(version_date) }.to raise_error(
          StandardError,
          "Version date must be in the future and after latest scheduled version date",
        )
      end
    end
  end
end

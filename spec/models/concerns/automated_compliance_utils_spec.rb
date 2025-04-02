require "rails_helper"

RSpec.describe AutomatedComplianceUtils do
  #permit_application uses this
  let!(:requirement_template) do
    create(:live_requirement_template_with_compliance)
  end
  let!(:permit_application) do
    create(
      :permit_application,
      template_version: requirement_template.published_template_version
    )
  end

  describe "requirement lookups" do
    #publish a second template with an additional lookup
    #it should not show up in the requirement_lookups
    it "utilizes the published template referenced by the permit application as the base"
  end

  describe "automated_compliance_requirements" do
    it "returns list of requirements with compliance" do
      expect(requirement_template.requirements.count).to eq 4
      expect(permit_application.automated_compliance_requirements.count).to eq 3
      expect(
        permit_application
          .automated_compliance_requirements
          .select { |key, req| req&.dig("computedCompliance").present? }
          .map { |key, req| req["id"] }
      ).to eq(
        requirement_template
          .requirements
          .select do |req|
            req&.input_options&.dig("computed_compliance").present?
          end
          .map(&:id)
      )
    end
  end

  describe "automated_compliance_unfilled_requirements" do
    it "returns a list of requirements that have not fetched their compliance data"
    #for regular compliance, it looks up the compliance_data hash
    #for files, it is on the supporting documents
  end

  describe "automated_compliance_unique_unfilled_modules" do
    it "returns a list of unique compliance modules to run if data is missing" do
      expect(
        permit_application.automated_compliance_unique_unfilled_modules.count
      ).to eq 1
    end

    #in the case of files, if there is a supporting document with the right data key it will count
  end

  describe "automated_compliance_requirements_for_module" do
    it "returns all requirements for a particular compliance module" do
      expect(
        permit_application.automated_compliance_requirements_for_module(
          "ParcelInfoExtractor"
        ).count
      ).to eq 2
    end
  end
end

require "rails_helper"

RSpec.describe AutomatedCompliance::ParcelInfoExtractor do
  let!(:requirement_template) { create(:requirement_template_with_compliance) }

  context "a PID not on ALR land" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pid: "031562868",
        full_address: "757 W Hastings St, Vancouver, BC V6C 1A1",
        template_version: requirement_template.published_template_version,
      )
    end

    it "updates an field in submission data" do
      permit_application.update_column(
        :compliance_data,
        {
          permit_application.automated_compliance_requirements.keys[0] => "previous_data",
          "unedited" => "previous_data",
        },
      )
      VCR.use_cassette("automated_compliance/parcel_info_extractor/details") do
        AutomatedCompliance::ParcelInfoExtractor.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(permit_application.automated_compliance_requirements.keys[0]),
        ).to_not eq("previous_data")
        # expect(permit_application.compliance_data.dig("parcel_status")).to eq("active")
        # expect(permit_application.compliance_data.dig("parcel_name")).to eq("031562868")
        # expect(permit_application.compliance_data.dig("parcel_class")).to eq("Subdivision")
        # expect(permit_application.compliance_data.dig("plan_number")).to eq("EPP115443")
        expect(
          permit_application.compliance_data.dig(permit_application.automated_compliance_requirements.keys[0]),
        ).to eq("Vancouver, City of")
        expect(
          permit_application.compliance_data.dig(permit_application.automated_compliance_requirements.keys[1]),
        ).to eq("Metro Vancouver Regional District")
        expect(permit_application.compliance_data.dig("unedited")).to eq("previous_data")
      end
    end

    it "updates an empty submission data" do
      VCR.use_cassette("automated_compliance/parcel_info_extractor/details") do
        AutomatedCompliance::ParcelInfoExtractor.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(permit_application.automated_compliance_requirements.keys[0]),
        ).to eq("Vancouver, City of")
        expect(
          permit_application.compliance_data.dig(permit_application.automated_compliance_requirements.keys[1]),
        ).to eq("Metro Vancouver Regional District")
      end
    end
  end
end

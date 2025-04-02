require "rails_helper"

RSpec.describe AutomatedCompliance::ParcelInfoExtractor do
  let!(:requirement_template) do
    create(:live_requirement_template_with_compliance)
  end

  context "a PID not on ALR land" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pid: "031562868",
        full_address: "757 W Hastings St, Vancouver, BC V6C 1A1",
        template_version: requirement_template.published_template_version
      )
    end

    it "updates an field in compliance data" do
      permit_application.update_column(
        :compliance_data,
        {
          permit_application.automated_compliance_requirements.keys[0] =>
            "previous_data",
          "unedited" => "previous_data"
        }
      )
      VCR.use_cassette("automated_compliance/parcel_info_extractor/details") do
        AutomatedCompliance::ParcelInfoExtractor.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to_not eq("previous_data")
        # expect(permit_application.compliance_data.dig("parcel_status")).to eq("active")
        # expect(permit_application.compliance_data.dig("parcel_name")).to eq("031562868")
        # expect(permit_application.compliance_data.dig("parcel_class")).to eq("Subdivision")
        # expect(permit_application.compliance_data.dig("plan_number")).to eq("EPP115443")
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to eq(6244.2759)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[1]
          )
        ).to eq(6244.2759)
        expect(permit_application.compliance_data.dig("unedited")).to eq(
          "previous_data"
        )
      end
    end

    it "updates an empty submission data" do
      VCR.use_cassette("automated_compliance/parcel_info_extractor/details") do
        AutomatedCompliance::ParcelInfoExtractor.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to eq(6244.2759)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[1]
          )
        ).to eq(6244.2759)
      end
    end
  end

  context "a PIN" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pin: "15304230",
        pid: nil,
        full_address: "3090 Takaya Dr, North Vancouver, BC V7H 3A8",
        template_version: requirement_template.published_template_version
      )
    end

    it "updates the field in compliance data" do
      permit_application.update_column(
        :compliance_data,
        {
          permit_application.automated_compliance_requirements.keys[0] =>
            "previous_data",
          "unedited" => "previous_data"
        }
      )
      VCR.use_cassette(
        "automated_compliance/parcel_info_extractor/details_pin"
      ) do
        AutomatedCompliance::ParcelInfoExtractor.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to_not eq("previous_data")
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to eq(1120116.7031)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[1]
          )
        ).to eq(1120116.7031)
        expect(permit_application.compliance_data.dig("unedited")).to eq(
          "previous_data"
        )
      end
    end
  end
end

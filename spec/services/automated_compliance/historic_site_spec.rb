require "rails_helper"

RSpec.describe AutomatedCompliance::HistoricSite do
  let!(:requirement_template) { create(:requirement_template_with_heritage) }

  context "a PID that is a historic site and parcel description matches" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pid: "000561444",
        full_address: "1275 ST. DAVID ST, VICTORIA, BC, V8S 4Z1",
      )
    end

    it "respond to let them know that this is a historic site and they should check it carefully" do
      VCR.use_cassette("automated_compliance/historic_site/matched_by_legal") do
        AutomatedCompliance::HistoricSite.new.call(permit_application)
        expect(
          permit_application.submission_data.dig("data", permit_application.automated_compliance_requirements.keys[0]),
        ).to eq("Yes")
      end
    end
  end

  context "a PID that is a historic site and the parcel desription does not match the PID" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pid: "005706297",
        full_address: "770 BERNARD AVE, KELOWNA, BC, V1Y 6P5",
      )
    end

    it "respond to let them know that this is a historic site and they should check it carefully" do
      VCR.use_cassette("automated_compliance/historic_site/matched_by_geometry") do
        AutomatedCompliance::HistoricSite.new.call(permit_application)
        expect(
          permit_application.submission_data.dig("data", permit_application.automated_compliance_requirements.keys[0]),
        ).to eq("Yes")
      end
    end
  end

  context "a PID not on a historic site" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pid: "004920414",
        full_address: "595 BURRARD ST, VANCOUVER, BC, V7X 1M4",
      )
    end

    it "respond to let them know that this is a historic site and they should check it carefully" do
      VCR.use_cassette("automated_compliance/historic_site/unmatched") do
        AutomatedCompliance::HistoricSite.new.call(permit_application)
        expect(
          (permit_application.submission_data || {}).dig(
            "data",
            permit_application.automated_compliance_requirements.keys[0],
          ),
        ).to eq(nil)
      end
    end
  end
end

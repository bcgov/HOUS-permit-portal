require "rails_helper"

RSpec.describe AutomatedCompliance::HistoricSite,
               type: :service,
               search: true do
  let(:vcr_options) { { match_requests_on: %i[method path query] } }

  before do
    allow_any_instance_of(Wrappers::LtsaParcelMapBc).to receive(
      :get_coordinates_by_pid
    ).and_return(nil)
  end

  let!(:requirement_template) do
    create(:live_requirement_template_with_heritage)
  end

  context "a PID that is a historic site and parcel description matches" do
    let!(:permit_application) do
      create(
        :permit_application,
        permit_type: requirement_template.permit_type,
        activity: requirement_template.activity,
        pid: "000561444",
        full_address: "1275 ST. DAVID ST, VICTORIA, BC, V8S 4Z1",
        template_version: requirement_template.published_template_version
      )
    end

    it "respond to let them know that this is a historic site and they should check it carefully" do
      VCR.use_cassette(
        "automated_compliance/historic_site/matched_by_legal",
        vcr_options
      ) do
        AutomatedCompliance::HistoricSite.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to eq("yes")
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
        template_version: requirement_template.published_template_version
      )
    end

    it "respond to let them know that this is a historic site and they should check it carefully" do
      VCR.use_cassette(
        "automated_compliance/historic_site/matched_by_geometry",
        vcr_options
      ) do
        AutomatedCompliance::HistoricSite.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to eq("yes")
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
        template_version: requirement_template.published_template_version
      )
    end

    it "respond to let them know that this is a historic site and they should check it carefully" do
      VCR.use_cassette(
        "automated_compliance/historic_site/unmatched",
        vcr_options
      ) do
        AutomatedCompliance::HistoricSite.new.call(permit_application)
        expect(
          permit_application.compliance_data.dig(
            permit_application.automated_compliance_requirements.keys[0]
          )
        ).to eq(nil)
      end
    end
  end
end

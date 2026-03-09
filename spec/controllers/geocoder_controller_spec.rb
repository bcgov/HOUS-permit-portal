require "rails_helper"

RSpec.describe Api::GeocoderController, type: :controller do
  let(:user) { create(:user) }
  let(:geocoder_wrapper) { instance_double(Wrappers::Geocoder) }
  let(:ltsa_wrapper) { instance_double(Wrappers::LtsaParcelMapBc) }

  before do
    sign_in user
    allow(Wrappers::Geocoder).to receive(:new).and_return(geocoder_wrapper)
    allow(Wrappers::LtsaParcelMapBc).to receive(:new).and_return(ltsa_wrapper)
  end

  describe "GET #site_options" do
    it "returns options for a provided address" do
      allow(geocoder_wrapper).to receive(:site_options).with(
        "123 Main St"
      ).and_return([{ label: "123 Main St", value: "site-1" }])

      get :site_options, params: { address: "123 Main St" }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].first["value"]).to eq("site-1")
    end

    it "returns an empty array when address is blank" do
      get :site_options, params: {}, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to eq([])
    end
  end

  describe "GET #pids" do
    it "returns pid list for a site id" do
      allow(geocoder_wrapper).to receive(:pids).with("site-1").and_return(
        %w[123-456-789]
      )

      get :pids, params: { site_id: "site-1" }, format: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(["123-456-789"])
    end
  end

  describe "GET #jurisdiction" do
    let(:jurisdiction) { create(:sub_district) }

    it "returns the matched jurisdiction and ltsa_matcher metadata" do
      allow(geocoder_wrapper).to receive(:pids).with("site-1").and_return(
        %w[123-456-789]
      )
      allow(ltsa_wrapper).to receive(:get_feature_attributes_by_pid).with(
        pid: "123-456-789"
      ).and_return({ "pid" => "123-456-789" })
      allow(Jurisdiction).to receive(
        :ltsa_matcher_from_ltsa_attributes
      ).and_return("matched_by_pid")
      allow(Jurisdiction).to receive(
        :fuzzy_find_by_ltsa_feature_attributes
      ).and_return(jurisdiction)

      get :jurisdiction,
          params: {
            site_id: "site-1",
            include_ltsa_matcher: true
          },
          format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]["id"]).to eq(jurisdiction.id)
      expect(json_response["meta"]["ltsa_matcher"]).to eq("matched_by_pid")
    end
  end

  describe "GET #pin" do
    it "returns feature attributes for a pin lookup" do
      allow(ltsa_wrapper).to receive(
        :get_feature_attributes_by_pid_or_pin
      ).with(pin: "PIN-1", pid: nil).and_return({ "pin" => "PIN-1" })

      get :pin, params: { pin: "PIN-1" }, format: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["pin"]).to eq({ "pin" => "PIN-1" })
    end
  end

  describe "GET #pid_details" do
    it "returns a matching site option for the provided pid" do
      allow(ltsa_wrapper).to receive(:get_coordinates_by_pid).with(
        "123-456-789"
      ).and_return({ centroid: [-123.1, 49.2] })
      allow(geocoder_wrapper).to receive(:site_options).with(
        nil,
        [-123.1, 49.2]
      ).and_return([{ label: "Site A", value: "site-a" }])
      allow(geocoder_wrapper).to receive(:pids).with("site-a").and_return(
        ["123-456-789"]
      )

      get :pid_details, params: { pid: "123-456-789" }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]["value"]).to eq("site-a")
    end
  end

  describe "GET #form_bc_addresses" do
    it "returns addresses from the geocoder wrapper" do
      allow(geocoder_wrapper).to receive(:site_options_raw).with(
        "main st"
      ).and_return([{ "text" => "123 Main St" }])

      get :form_bc_addresses,
          params: {
            addressString: "main st"
          },
          format: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([{ "text" => "123 Main St" }])
    end
  end
end

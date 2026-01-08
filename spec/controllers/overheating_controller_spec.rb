require "rails_helper"

RSpec.describe Api::OverheatingController, type: :controller do
  let(:submitter) { create(:user, :submitter) }
  let(:form_data) do
    {
      "project_number" => "123",
      "building_location" => {
        "address" => "123 Test St"
      }
    }
  end

  before { sign_in submitter }

  describe "POST #create" do
    context "with valid params" do
      it "creates a new OverheatingTool record with the form data" do
        expect {
          post :create,
               params: {
                 overheating_tool: {
                   form_json: form_data,
                   form_type: "single_zone_cooling_heating_tool"
                 }
               },
               as: :json
        }.to change(OverheatingTool, :count).by(1)

        overheating_tool =
          OverheatingTool.find(JSON.parse(response.body)["data"]["id"])
        expect(overheating_tool.user_id).to eq(submitter.id)
        expect(overheating_tool.form_json).to eq(form_data)
        expect(overheating_tool.form_type).to eq(
          "single_zone_cooling_heating_tool"
        )
      end
    end

    context "with invalid params" do
      it "does not create an OverheatingTool and returns unprocessable_entity" do
        post :create,
             params: {
               overheating_tool: {
                 form_json: nil
               }
             },
             as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(OverheatingTool.count).to eq(0)
      end
    end
  end
end

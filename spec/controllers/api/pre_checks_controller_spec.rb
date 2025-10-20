require "rails_helper"

RSpec.describe Api::PreChecksController, type: :controller, search: true do
  render_views

  let(:user) { create(:user) }

  before do
    sign_in user
    request.headers["ACCEPT"] = "application/json"
  end

  describe "POST #index" do
    it "returns the current user's pre-checks" do
      permit_project_mine = create(:permit_project, title: "Mine", owner: user)
      permit_application_mine =
        create(
          :permit_application,
          permit_project: permit_project_mine,
          submitter: user
        )
      mine =
        create(
          :pre_check,
          creator: user,
          permit_application: permit_application_mine
        )

      permit_project_theirs = create(:permit_project, title: "Theirs")
      permit_application_theirs =
        create(
          :permit_application,
          permit_project: permit_project_theirs,
          submitter: create(:user)
        )
      create(
        :pre_check,
        creator: permit_application_theirs.submitter,
        permit_application: permit_application_theirs
      )

      PreCheck.reindex
      PreCheck.search_index.refresh

      post :index, params: { query: "Mine" }, format: :json

      expect(response).to have_http_status(:success)
      expect(json_response["data"]).to contain_exactly(
        hash_including("id" => mine.id)
      )
    end
  end

  describe "POST #create" do
    it "creates a pre-check" do
      expect do
        post :create,
             params: {
               pre_check: {
                 full_address: "123 Test St"
               }
             },
             as: :json
      end.to change(PreCheck, :count).by(1)

      expect(response).to have_http_status(:success)
    end
  end
end

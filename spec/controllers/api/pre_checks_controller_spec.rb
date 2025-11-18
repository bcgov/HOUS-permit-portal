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

  describe "POST #index with unviewed_count" do
    it "returns unviewed_count in meta" do
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :complete, creator: user, viewed_at: 1.hour.ago)

      PreCheck.reindex
      PreCheck.search_index.refresh

      post :index, params: {}, format: :json

      expect(response).to have_http_status(:success)
      expect(json_response["meta"]["unviewed_count"]).to eq(2)
    end

    it "only counts current user's unviewed pre-checks" do
      other_user = create(:user)
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :complete, creator: other_user, viewed_at: nil)

      PreCheck.reindex
      PreCheck.search_index.refresh

      post :index, params: {}, format: :json

      expect(response).to have_http_status(:success)
      expect(json_response["meta"]["unviewed_count"]).to eq(1)
    end
  end

  describe "PATCH #mark_viewed" do
    let(:pre_check) do
      create(:pre_check, :complete, creator: user, viewed_at: nil)
    end

    it "updates viewed_at timestamp" do
      expect do
        patch :mark_viewed, params: { id: pre_check.id }, format: :json
      end.to change { pre_check.reload.viewed_at }.from(nil)

      expect(response).to have_http_status(:success)
    end

    it "returns the updated pre-check" do
      patch :mark_viewed, params: { id: pre_check.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(json_response["data"]["id"]).to eq(pre_check.id)
      expect(json_response["data"]["viewed_at"]).not_to be_nil
    end

    context "when user is not authorized" do
      let(:other_user) { create(:user) }
      let(:other_pre_check) do
        create(:pre_check, :complete, creator: other_user, viewed_at: nil)
      end

      it "returns forbidden" do
        patch :mark_viewed, params: { id: other_pre_check.id }, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end

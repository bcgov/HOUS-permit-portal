require "rails_helper"

RSpec.describe Api::OverheatingCodesController,
               type: :controller,
               search: true do
  render_views

  let(:user) { create(:user) }

  before do
    sign_in user
    request.headers["ACCEPT"] = "application/json"
  end

  describe "POST #index" do
    it "returns the current user's overheating codes" do
      mine = create(:overheating_code, creator: user, issued_to: "My Record")
      create(:overheating_code, creator: create(:user), issued_to: "Theirs")

      OverheatingCode.reindex
      OverheatingCode.search_index.refresh

      post :index, params: {}, format: :json

      expect(response).to have_http_status(:success)
      ids = json_response["data"].map { |r| r["id"] }
      expect(ids).to include(mine.id)
    end

    it "does not return other users' overheating codes" do
      create(:overheating_code, creator: create(:user), issued_to: "Theirs")

      OverheatingCode.reindex
      OverheatingCode.search_index.refresh

      post :index, params: {}, format: :json

      expect(response).to have_http_status(:success)
      expect(json_response["data"]).to be_empty
    end
  end

  describe "GET #show" do
    it "returns the overheating code for the creator" do
      overheating_code = create(:overheating_code, creator: user)

      get :show, params: { id: overheating_code.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(json_response["data"]["id"]).to eq(overheating_code.id)
    end

    it "returns forbidden for non-creator" do
      overheating_code = create(:overheating_code, creator: create(:user))

      get :show, params: { id: overheating_code.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST #create" do
    it "creates an overheating code with valid params" do
      expect do
        post :create,
             params: {
               overheating_code: {
                 issued_to: "Jane Smith",
                 project_number: "PRJ-001"
               }
             },
             as: :json
      end.to change(OverheatingCode, :count).by(1)

      expect(response).to have_http_status(:success)
      expect(json_response["data"]["issued_to"]).to eq("Jane Smith")
    end

    it "creates a draft record with empty params" do
      expect do
        post :create, params: { overheating_code: {} }, as: :json
      end.to change(OverheatingCode, :count).by(1)

      expect(response).to have_http_status(:success)
      expect(json_response["data"]["status"]).to eq("draft")
    end

    it "assigns the current user as creator" do
      post :create,
           params: {
             overheating_code: {
               issued_to: "Test"
             }
           },
           as: :json

      expect(json_response["data"]["creator"]["id"]).to eq(user.id)
    end
  end

  describe "PATCH #update" do
    let(:overheating_code) { create(:overheating_code, creator: user) }

    it "updates the overheating code" do
      patch :update,
            params: {
              id: overheating_code.id,
              overheating_code: {
                issued_to: "Updated Name",
                postal_code: "V6B 2K1"
              }
            },
            as: :json

      expect(response).to have_http_status(:success)
      expect(json_response["data"]["issued_to"]).to eq("Updated Name")
      expect(json_response["data"]["postal_code"]).to eq("V6B 2K1")
    end

    it "updates JSONB array fields" do
      patch :update,
            params: {
              id: overheating_code.id,
              overheating_code: {
                components_facing_outside: ["Exterior wall R-20", "Roof R-40"],
                document_notes: ["Report attached"]
              }
            },
            as: :json

      expect(response).to have_http_status(:success)
      expect(json_response["data"]["components_facing_outside"]).to eq(
        ["Exterior wall R-20", "Roof R-40"]
      )
      expect(json_response["data"]["document_notes"]).to eq(["Report attached"])
    end

    it "returns forbidden for non-creator" do
      other_code = create(:overheating_code, creator: create(:user))

      patch :update,
            params: {
              id: other_code.id,
              overheating_code: {
                issued_to: "Hacked"
              }
            },
            as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "rejects invalid postal code" do
      patch :update,
            params: {
              id: overheating_code.id,
              overheating_code: {
                postal_code: "12345"
              }
            },
            as: :json

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "DELETE #destroy" do
    let(:overheating_code) { create(:overheating_code, creator: user) }

    it "soft-deletes the overheating code" do
      delete :destroy, params: { id: overheating_code.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(overheating_code.reload.discarded_at).not_to be_nil
    end

    it "returns forbidden for non-creator" do
      other_code = create(:overheating_code, creator: create(:user))

      delete :destroy, params: { id: other_code.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH #restore" do
    let(:overheating_code) do
      create(:overheating_code, :discarded, creator: user)
    end

    it "restores a discarded overheating code" do
      patch :restore, params: { id: overheating_code.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(overheating_code.reload.discarded_at).to be_nil
    end

    it "returns forbidden for non-creator" do
      other_code = create(:overheating_code, :discarded, creator: create(:user))

      patch :restore, params: { id: other_code.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET #generate_pdf" do
    let(:overheating_code) do
      create(:overheating_code, :complete, creator: user)
    end

    it "returns a PDF attachment" do
      get :generate_pdf, params: { id: overheating_code.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(response.content_type).to include("application/pdf")
      expect(response.headers["Content-Disposition"]).to include("attachment")
      expect(response.headers["Content-Disposition"]).to include(
        "BC-SZCG-Report"
      )
    end

    it "returns forbidden for non-creator" do
      other_code = create(:overheating_code, :complete, creator: create(:user))

      get :generate_pdf, params: { id: other_code.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end

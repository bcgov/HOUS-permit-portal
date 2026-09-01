require "rails_helper"

RSpec.describe Api::InfoDocumentsController, type: :controller do
  describe "GET #index" do
    it "returns only published documents to public users" do
      published = create(:info_document, :published)
      create(:info_document, :with_file)

      get :index, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to contain_exactly(published.id)
    end

    it "returns unpublished documents to super admins" do
      published = create(:info_document, :published)
      draft = create(:info_document, :with_file)
      sign_in create(:user, :super_admin)

      get :index, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to contain_exactly(
        published.id,
        draft.id
      )
    end

    it "returns only published documents to super admins when published_only is requested" do
      published = create(:info_document, :published)
      create(:info_document, :with_file)
      sign_in create(:user, :super_admin)

      get :index, params: { published_only: true }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to contain_exactly(published.id)
    end

    it "returns published documents in display order" do
      later = create(:info_document, :published)
      earlier = create(:info_document, :published)
      later.update_column(:sort_order, 1)
      earlier.update_column(:sort_order, 0)

      get :index, format: :json

      expect(json_response["data"].pluck("id")).to eq([earlier.id, later.id])
    end

    it "includes open and download urls for published files" do
      create(:info_document, :published)
      allow_any_instance_of(InfoDocument).to receive(:file_url_safe).with(
        disposition: "inline"
      ).and_return("https://example.com/information-sheet.pdf")
      allow_any_instance_of(InfoDocument).to receive(:file_url_safe).with(
        disposition: "attachment"
      ).and_return("https://example.com/information-sheet-download.pdf")

      get :index, format: :json

      document = json_response["data"].first
      expect(document["file_url"]).to eq(
        "https://example.com/information-sheet.pdf"
      )
      expect(document["download_url"]).to eq(
        "https://example.com/information-sheet-download.pdf"
      )
    end

    it "omits file urls when the file is unavailable" do
      published = create(:info_document, :published)
      published.update_columns(file_data: nil, scan_status: "infected")

      get :index, format: :json

      document = json_response["data"].first
      expect(document["file_url"]).to be_nil
      expect(document["download_url"]).to be_nil
    end
  end

  describe "POST #publish" do
    it "does not publish a document without a file" do
      document = create(:info_document)
      sign_in create(:user, :super_admin)

      post :publish, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:bad_request)
      expect(document.reload).not_to be_published
    end

    it "publishes a document with a file and topics" do
      document = create(:info_document, :with_file)
      sign_in create(:user, :super_admin)

      post :publish, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(document.reload).to be_published
    end
  end

  describe "DELETE #destroy" do
    it "prevents non-super admins from deleting documents" do
      document = create(:info_document, :with_file)
      sign_in create(:user)

      delete :destroy, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:forbidden)
      expect(InfoDocument.exists?(document.id)).to be(true)
    end

    it "allows super admins to delete documents" do
      document = create(:info_document, :with_file)
      sign_in create(:user, :super_admin)

      delete :destroy, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(InfoDocument.exists?(document.id)).to be(false)
    end
  end

  describe "POST #create" do
    it "saves freeform topics as tags" do
      sign_in create(:user, :super_admin)

      post :create,
           params: {
             info_document: {
               title: "Cost information sheet",
               topic_list: ["Getting started", "Cost"]
             }
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(InfoDocument.last.topic_list).to contain_exactly(
        "Getting started",
        "Cost"
      )
    end

    it "attaches an uploaded file" do
      sign_in create(:user, :super_admin)

      post :create,
           params: {
             info_document: {
               title: "Cost information sheet",
               topic_list: ["Cost"],
               file:
                 TestData.cached_file_data(filename: "information-sheet.pdf")
             }
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(InfoDocument.last.file_name).to eq("information-sheet.pdf")
    end
  end

  describe "PATCH #update" do
    it "prevents anonymous users from mutating the catalog" do
      document = create(:info_document, :with_file)

      patch :update,
            params: {
              id: document.id,
              info_document: {
                title: "Updated title"
              }
            },
            format: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "replaces the file on a published document" do
      document = create(:info_document, :published)
      sign_in create(:user, :super_admin)

      patch :update,
            params: {
              id: document.id,
              info_document: {
                file: TestData.cached_file_data(filename: "replacement.pdf")
              }
            },
            format: :json

      expect(response).to have_http_status(:ok)
      document.reload
      expect(document.file_name).to eq("replacement.pdf")
      expect(document).to be_published
    end
  end

  describe "GET #show" do
    it "returns a published document without authentication" do
      document = create(:info_document, :published)

      get :show, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(document.id)
    end

    it "does not return an unpublished document to public users" do
      document = create(:info_document, :with_file)

      get :show, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns an unpublished document to super admins" do
      document = create(:info_document, :with_file)
      sign_in create(:user, :super_admin)

      get :show, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(document.id)
    end
  end

  describe "POST #unpublish" do
    it "unpublishes a published document" do
      document = create(:info_document, :published)
      sign_in create(:user, :super_admin)

      post :unpublish, params: { id: document.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(document.reload).not_to be_published
    end
  end

  describe "POST #reorder" do
    it "allows super admins to reorder documents" do
      sign_in create(:user, :super_admin)
      first = create(:info_document, :with_file, sort_order: 0)
      second = create(:info_document, :with_file, sort_order: 1)

      post :reorder,
           params: {
             ordered_ids: [second.id, first.id]
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(first.reload.sort_order).to eq(1)
      expect(second.reload.sort_order).to eq(0)
    end

    it "prevents non-super admins from reordering" do
      sign_in create(:user)
      first = create(:info_document, :with_file, sort_order: 0)
      second = create(:info_document, :with_file, sort_order: 1)

      post :reorder,
           params: {
             ordered_ids: [second.id, first.id]
           },
           format: :json

      expect(response).to have_http_status(:forbidden)
      expect(first.reload.sort_order).to eq(0)
    end
  end
end

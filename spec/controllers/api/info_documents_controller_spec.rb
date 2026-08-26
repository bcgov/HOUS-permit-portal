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

      expect(json_response["data"].pluck("id")).to eq(
        [earlier.id, later.id]
      )
    end

    it "includes open and download urls for published files" do
      create(:info_document, :published)
      allow_any_instance_of(InfoDocumentFile).to receive(:file_url_safe).with(
        disposition: "inline"
      ).and_return("https://example.com/guide.pdf")
      allow_any_instance_of(InfoDocumentFile).to receive(:file_url_safe).with(
        disposition: "attachment"
      ).and_return("https://example.com/guide-download.pdf")

      get :index, format: :json

      file = json_response["data"].first["document_file"]
      expect(file["file_url"]).to eq("https://example.com/guide.pdf")
      expect(file["download_url"]).to eq(
        "https://example.com/guide-download.pdf"
      )
    end

    it "omits file urls when the file is unavailable" do
      published = create(:info_document, :published)
      published.document_file.update_columns(
        file_data: nil,
        scan_status: "infected"
      )

      get :index, format: :json

      file = json_response["data"].first["document_file"]
      expect(file["file_url"]).to be_nil
      expect(file["download_url"]).to be_nil
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
               title: "Cost guide",
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
  end
end

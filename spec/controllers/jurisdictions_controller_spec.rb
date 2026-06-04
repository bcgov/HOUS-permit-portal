require "rails_helper"

RSpec.describe Api::JurisdictionsController, type: :controller do
  let(:jurisdiction) { create(:sub_district) }
  let(:super_admin) { create(:user, :super_admin) }
  let!(:review_managers) do
    create_list(:user, 5, :review_manager, jurisdiction: jurisdiction)
  end
  let!(:discarded_review_managers) do
    create_list(:user, 5, :review_manager, jurisdiction: jurisdiction).each(
      &:discard
    )
  end
  let!(:reviewers) do
    create_list(:user, 5, :reviewer, jurisdiction: jurisdiction)
  end

  describe "POST #search_users" do
    before do
      sign_in super_admin
      User.reindex
    end

    context "It only returns review_managers and not reviewers" do
      it "returns a successful response with the correct data structure" do
        get :search_users,
            params: {
              id: jurisdiction.id,
              query: "",
              page: 1,
              per_page: 10
            }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to match_array(
          review_managers.pluck(:id)
        )
      end
    end

    context "when all users are discarded" do
      it "does not return discarded users if show_archived is not present" do
        post :search_users, params: { id: jurisdiction.id, query: "" }
        expect(json_response["data"].pluck("id")).to match_array(
          review_managers.pluck(:id)
        )
      end

      it "returns discarded users if show_archived is present" do
        post :search_users,
             params: {
               id: jurisdiction.id,
               query: "",
               show_archived: true
             }
        expect(json_response["data"].pluck("id")).to match_array(
          discarded_review_managers.pluck(:id)
        )
      end
    end
  end

  describe "logged in as super_admin" do
    let!(:review_manager) do
      create(
        :user,
        :review_manager,
        email: "review_manager@example.com",
        jurisdiction: jurisdiction
      )
    end
    let!(:regional_review_manager) do
      create(
        :user,
        :regional_review_manager,
        email: "regional_review_manager@example.com",
        jurisdiction: jurisdiction
      )
    end

    before do
      sign_in super_admin
      Jurisdiction.reindex
    end

    context "searching with review manager email" do
      it "should give me the associtated jurisdictions for the review manager" do
        post :index,
             params: {
               query: "review_manager@example.com",
               page: 1,
               per_page: 10
             }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to include(jurisdiction.id)
      end
    end

    context "searching with regional review manager email" do
      it "should give me the associtated jurisdictions for that regional review manager" do
        post :index,
             params: {
               query: "regional_review_manager@example.com",
               page: 1,
               per_page: 10
             }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to include(jurisdiction.id)
      end
    end
  end

  describe "Didn't logged in and" do
    before {}

    context "searching with review manager email" do
      it "should not give me the associtated jurisdictions for the review manager" do
        post :index,
             params: {
               query: "review_manager@example.com",
               page: 1,
               per_page: 10
             }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to_not include(
          jurisdiction.id
        )
      end
    end

    context "searching with regional review manager email" do
      it "should not give me the associtated jurisdictions for that regional review manager" do
        post :index,
             params: {
               query: "regional_review_manager@example.com",
               page: 1,
               per_page: 10
             }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to_not include(
          jurisdiction.id
        )
      end
    end
  end

  describe "additional actions" do
    let(:super_admin_user) { create(:user, :super_admin) }

    before { sign_in super_admin_user }

    it "returns locality type options" do
      get :locality_type_options, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).not_to be_empty
    end

    it "creates a jurisdiction" do
      post :create,
           params: {
             jurisdiction: {
               name: "New Jurisdiction",
               locality_type: "city"
             }
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]["name"]).to eq("New Jurisdiction")
    end

    it "updates external api enabled state" do
      target_jurisdiction = create(:sub_district, external_api_state: "j_on")
      allow_any_instance_of(Jurisdiction).to receive(
        :update_external_api_state!
      ).and_return(true)

      patch :update_external_api_enabled,
            params: {
              id: target_jurisdiction.id,
              external_api_enabled: false
            },
            format: :json

      expect(response).to have_http_status(:ok)
    end

    it "returns jurisdiction options from search results" do
      search_result = instance_double("SearchResult", results: [jurisdiction])
      allow(Jurisdiction).to receive(:search).and_return(search_result)

      get :jurisdiction_options,
          params: {
            jurisdiction: {
              name: "test"
            }
          },
          format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).not_to be_empty
    end
  end

  describe "PATCH #update project meetings flag" do
    it "allows jurisdiction managers" do
      manager = create(:user, :review_manager, jurisdiction: jurisdiction)
      sign_in manager

      patch :update,
            params: {
              id: jurisdiction.id,
              jurisdiction: {
                project_meetings_enabled: true
              }
            },
            format: :json

      expect(response).to have_http_status(:ok)
      expect(jurisdiction.reload.project_meetings_enabled).to eq(true)
    end

    it "allows technical support members" do
      tech = create(:user, role: :technical_support)
      create(:jurisdiction_membership, user: tech, jurisdiction: jurisdiction)
      sign_in tech

      patch :update,
            params: {
              id: jurisdiction.id,
              jurisdiction: {
                project_meetings_enabled: true
              }
            },
            format: :json

      expect(response).to have_http_status(:ok)
    end

    it "updates project meeting notification recipient contacts" do
      manager = create(:user, :review_manager, jurisdiction: jurisdiction)
      sign_in manager

      patch :update,
            params: {
              id: jurisdiction.id,
              jurisdiction: {
                submission_contacts_attributes: [
                  {
                    email: "meetings@example.com",
                    type: "MeetingSubmissionContact"
                  }
                ]
              }
            },
            format: :json

      expect(response).to have_http_status(:ok)
      contact = jurisdiction.reload.project_meeting_contacts.first
      expect(contact.email).to eq("meetings@example.com")
      expect(contact).to be_a(MeetingSubmissionContact)
      expect(json_response["data"]["submission_contacts"]).to include(
        a_hash_including(
          "email" => "meetings@example.com",
          "type" => "MeetingSubmissionContact"
        )
      )
    end

    it "blocks reviewers" do
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      sign_in reviewer

      patch :update,
            params: {
              id: jurisdiction.id,
              jurisdiction: {
                project_meetings_enabled: true
              }
            },
            format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "blocks reviewers from updating project meeting notification recipients" do
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      sign_in reviewer

      patch :update,
            params: {
              id: jurisdiction.id,
              jurisdiction: {
                submission_contacts_attributes: [
                  {
                    email: "meetings@example.com",
                    type: "MeetingSubmissionContact"
                  }
                ]
              }
            },
            format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end

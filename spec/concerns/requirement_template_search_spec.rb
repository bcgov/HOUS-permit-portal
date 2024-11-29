require "rails_helper"

RSpec.describe Api::RequirementTemplatesController, type: :controller do
  let(:demolition_activity) { create(:activity, code: :demolition) }
  let(:alteration_activity) { create(:activity, code: :site_alteration) }
  let(:high_permit_type) { create(:permit_type, code: :high_residential) }

  # Define a helper method to parse JSON responses
  def json_response
    JSON.parse(response.body)
  end

  let!(:requirement_template1) do
    create(
      :live_requirement_template,
      description: "Template One",
      activity: demolition_activity,
      created_at: 10.days.ago
    )
  end

  let!(:requirement_template2) do
    create(
      :live_requirement_template,
      description: "Template Two",
      permit_type: high_permit_type,
      first_nations: true,
      created_at: 9.days.ago
    )
  end

  let!(:requirement_template3) do
    create(
      :live_requirement_template,
      description: "Template Three",
      activity: alteration_activity,
      created_at: 10.days.ago
    )
  end

  let!(:requirement_template4) do
    create(
      :live_requirement_template,
      description: "Template Four",
      activity: alteration_activity,
      first_nations: true,
      created_at: 9.days.ago
    )
  end

  let!(:archived_template) do
    create(
      :live_requirement_template,
      description: "Archived Template",
      discarded_at: Time.current,
      created_at: 8.days.ago
    )
  end

  let!(:early_access_template) do
    create(
      :early_access_requirement_template,
      description: "Early Access Template",
      first_nations: false,
      created_at: 7.days.ago
    )
  end

  let!(:super_admin) { create(:user, :super_admin) }
  let!(:submitter) { create(:user) }

  before do
    # Ensure search data is up-to-date
    RequirementTemplate.reindex
    RequirementTemplate.search_index.refresh
  end

  describe "GET #index" do
    context "when user is a super admin" do
      before { sign_in super_admin }

      context "filtering by visibility 'live'" do
        it "returns all live non-archived requirement templates" do
          get :index,
              params: {
                query: "",
                page: 1,
                per_page: 20,
                visibility: "live"
              }
          expect(response).to have_http_status(:success)
          expect(json_response["data"].map { |rt| rt["id"] }).to match_array(
            [
              requirement_template1.id,
              requirement_template2.id,
              requirement_template3.id,
              requirement_template4.id
            ]
          )
          expect(json_response["data"].map { |rt| rt["id"] }).not_to include(
            archived_template.id
          )
        end
      end

      context "filtering by visibility 'early_access'" do
        it "returns only early access requirement templates" do
          get :index,
              params: {
                query: "",
                visibility: "early_access",
                page: 1,
                per_page: 20
              }
          expect(response).to have_http_status(:success)
          expect(
            json_response["data"].map { |rt| rt["id"] }
          ).to contain_exactly(early_access_template.id)
        end
      end

      context "including archived templates" do
        it "includes archived requirement templates when show_archived is true" do
          get :index,
              params: {
                query: "",
                show_archived: true,
                page: 1,
                per_page: 20
              }
          expect(response).to have_http_status(:success)
          expect(json_response["data"].map { |rt| rt["id"] }).to include(
            archived_template.id
          )
        end
      end

      context "searching with a query" do
        it "returns templates matching the query" do
          get :index, params: { query: "Template One", page: 1, per_page: 20 }
          expect(response).to have_http_status(:success)
          expect(
            json_response["data"].map { |rt| rt["id"] }
          ).to contain_exactly(requirement_template1.id)
        end
      end

      context "sorting results" do
        it "sorts by description ascending" do
          get :index,
              params: {
                query: "",
                sort: {
                  field: "description",
                  direction: "asc"
                },
                page: 1,
                per_page: 20
              }
          expect(response).to have_http_status(:success)
          sorted_ids =
            LiveRequirementTemplate
              .where(discarded_at: nil)
              .order(:description)
              .pluck(:id)
          expect(json_response["data"].map { |rt| rt["id"] }).to eq(sorted_ids)
        end

        it "defaults to sorting by created_at descending when sort field is invalid" do
          get :index, params: { query: "", page: 1, per_page: 20 }
          expect(response).to have_http_status(:success)
          sorted_ids =
            LiveRequirementTemplate
              .where(discarded_at: nil)
              .order(created_at: :desc)
              .pluck(:id)
          expect(json_response["data"].map { |rt| rt["id"] }).to eq(sorted_ids)
        end
      end

      context "pagination" do
        before do
          RequirementTemplate.reindex
          RequirementTemplate.search_index.refresh
        end

        it "returns the correct number of results per page" do
          get :index, params: { query: "", page: 1, per_page: 2 }
          expect(response).to have_http_status(:success)
          expect(json_response["data"].size).to eq(2)
        end

        it "returns the correct page of results" do
          get :index, params: { query: "", page: 2, per_page: 2 }
          expect(response).to have_http_status(:success)
          # Assuming the first page has 2, the second page should have the next 2
          expect(json_response["data"].size).to eq(2)
          # Further assertions can be made based on the created templates
        end
      end
    end

    context "when user is a submitter user" do
      before { sign_in submitter }

      context "without any filters" do
        it "returns requirement templates based on user's permissions" do
          get :index, params: { query: "", page: 1, per_page: 20 }
          expect(response).to have_http_status(:success)
          # should not return any search results for submitter
          expect(json_response["data"].map { |rt| rt["id"] }).to match_array([])
        end
      end
    end

    context "when user is unauthenticated" do
      it "returns an unauthorized error" do
        get :index, params: { query: "", page: 1, per_page: 20 }
        expect(response).to have_http_status(401)
      end
    end
  end
end

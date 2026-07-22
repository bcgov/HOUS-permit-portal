# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::RequirementQuestionsController,
               type: :controller,
               search: true do
  let(:super_admin) { create(:user, :super_admin) }
  let(:submitter) { create(:user, :submitter) }
  let(:question_id) { SecureRandom.uuid }

  let(:valid_attributes) do
    {
      id: question_id,
      name: "Property owner name",
      description: "Internal catalogue description",
      association_list: ["zoning"],
      label: "Property Owner Name",
      input_type: "text",
      hint: "<p>help</p>"
    }
  end

  before { sign_in super_admin }

  describe "POST #create" do
    context "with valid parameters" do
      it "creates a shared requirement question with uuid-scoped requirement_code" do
        expect {
          post :create, params: { requirement_question: valid_attributes }
        }.to change(RequirementQuestion, :count).by(1)

        expect(response).to have_http_status(:success)

        question = RequirementQuestion.find(question_id)
        expect(question.shared).to eq(true)
        expect(question.name).to eq("Property owner name")
        expect(question.requirement_code).to eq(
          "#{question_id}:property_owner_name"
        )
        expect(question.association_list).to include("zoning")
        expect(json_response["meta"]["message"]["message"]).to eq(
          "Successfully created question!"
        )
      end

      it "does not persist placement-only configuration" do
        post :create,
             params: {
               requirement_question:
                 valid_attributes.merge(
                   input_options: {
                     computed_compliance: {
                       module: "DigitalSealValidator"
                     },
                     data_validation: {
                       operation: "min",
                       value: 1
                     }
                   }
                 )
             }

        expect(response).to have_http_status(:success)
        expect(
          RequirementQuestion.find(question_id).input_options
        ).not_to include("computed_compliance", "data_validation")
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        post :create, params: { requirement_question: valid_attributes }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "member actions on private questions" do
    let!(:private_question) { create(:requirement_question, shared: false) }

    it "does not expose private questions via show" do
      expect {
        get :show, params: { id: private_question.id }, format: :json
      }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it "does not allow updating private questions" do
      expect {
        put :update,
            params: {
              id: private_question.id,
              requirement_question: {
                name: "Should not apply",
                label: private_question.label,
                input_type: private_question.input_type
              }
            },
            format: :json
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe "POST #index (search)" do
    let!(:shared_question) { create(:requirement_question, :shared) }
    let!(:private_question) { create(:requirement_question, shared: false) }
    let!(:archived_question) do
      create(:requirement_question, :shared, discarded_at: Time.current)
    end

    before do
      RequirementQuestion.reindex
      RequirementQuestion.search_index.refresh
    end

    it "returns only shared, non-archived questions" do
      post :index, params: { query: "", page: 1, per_page: 20 }, format: :json

      expect(response).to have_http_status(:success)
      ids = json_response["data"].map { |row| row["id"] }
      expect(ids).to include(shared_question.id)
      expect(ids).not_to include(private_question.id)
      expect(ids).not_to include(archived_question.id)
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns an empty result set scoped by policy" do
        post :index, params: { query: "", page: 1, per_page: 20 }, format: :json

        expect(response).to have_http_status(:success)
        expect(json_response["data"]).to eq([])
      end
    end
  end
end

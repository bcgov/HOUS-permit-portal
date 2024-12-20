# spec/controllers/api/requirement_blocks_controller_spec.rb
require "rails_helper"

RSpec.describe Api::RequirementBlocksController, type: :controller do
  # Define users with different roles
  let(:super_admin) { create(:user, :super_admin) }
  let(:submitter) { create(:user, :submitter) }

  # Define a sample requirement block
  let(:requirement_block) { create(:requirement_block) }

  # Define attributes for creating/updating a requirement block
  let(:valid_attributes) do
    {
      visibility: "any",
      association_list: ["tag1"],
      requirements_attributes: [
        {
          requirement_code: "dummy-aba8e606-aedf-42af-933f-89542f44a1ab",
          input_type: "text",
          label: "test requirement label",
          hint: "<p>test help text</p>",
          required: false,
          elective: true,
          position: 0
        }
      ],
      name: "test name",
      description: "some description",
      display_name: "test display name",
      display_description: "<p>test instructions</p>"
    }
  end

  let(:invalid_attributes) do
    {
      name: "",
      first_nations: false,
      description: "Invalid requirement block with missing name",
      visibility: "any"
      # Missing other required fields if any
    }
  end

  before do
    # Assuming you're using Devise for authentication
    sign_in super_admin
  end

  describe "GET #show" do
    context "when the requirement block exists and user is authorized" do
      it "returns the requirement block" do
        get :show, params: { id: requirement_block.id }

        expect(response).to have_http_status(:success)
        expect(json_response).to include("data", "meta")
        expect(json_response["data"]["id"]).to eq(requirement_block.id)
        expect(json_response["data"]["name"]).to eq(requirement_block.name)
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        get :show, params: { id: requirement_block.id }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end

  describe "POST #create" do
    context "with valid parameters" do
      it "creates a new RequirementBlock and returns a success response" do
        expect {
          post :create, params: { requirement_block: valid_attributes }
        }.to change(RequirementBlock, :count).by(1)

        expect(response).to have_http_status(:success)
        expect(json_response).to include("data", "meta")
        expect(json_response["data"]["name"]).to eq("test name")
        expect(json_response["meta"]["message"]["message"]).to eq(
          "Successfully created requirement block!"
        )
      end
    end

    context "with invalid parameters" do
      it "does not create a new RequirementBlock and returns an error response" do
        expect {
          post :create, params: { requirement_block: invalid_attributes }
        }.not_to change(RequirementBlock, :count)

        expect(response).to have_http_status(:bad_request)
        expect(json_response["meta"]["message"]["message"]).to include(
          "Name can't be blank"
        )
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        post :create, params: { requirement_block: valid_attributes }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end

  describe "PATCH/PUT #update" do
    let!(:existing_block) { create(:requirement_block, name: "Old Name") }

    context "with valid parameters" do
      let(:new_attributes) do
        { name: "Updated Name", description: "Updated Description" }
      end

      it "updates the requested requirement block and returns a success response" do
        patch :update,
              params: {
                id: existing_block.id,
                requirement_block: new_attributes
              }

        existing_block.reload
        expect(existing_block.name).to eq("Updated Name")
        expect(existing_block.description).to eq("Updated Description")

        expect(response).to have_http_status(:success)
        expect(json_response["data"]["name"]).to eq("Updated Name")
        expect(json_response["meta"]["message"]).to be_nil
      end
    end

    context "with invalid parameters" do
      let(:invalid_update_attributes) do
        { name: "", description: "Updated Description" }
      end

      it "does not update the requirement block and returns an error response" do
        patch :update,
              params: {
                id: existing_block.id,
                requirement_block: invalid_update_attributes
              }

        existing_block.reload
        expect(existing_block.name).to eq("Old Name") # Name should not have changed

        expect(response).to have_http_status(:bad_request)
        expect(json_response["meta"]["message"]["message"]).to include(
          "Name can't be blank"
        )
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        patch :update,
              params: {
                id: existing_block.id,
                requirement_block: {
                  name: "New Name"
                }
              }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end

  describe "DELETE #destroy" do
    let!(:block_to_destroy) { create(:requirement_block) }

    context "when the requirement block is successfully discarded" do
      it "discards the requirement block and returns a success response" do
        delete :destroy, params: { id: block_to_destroy.id }

        expect(block_to_destroy.reload.discarded?).to be_truthy
        expect(response).to have_http_status(:success)
        expect(json_response["data"]["id"]).to eq(block_to_destroy.id)
        expect(json_response["meta"]["message"]["message"]).to eq(
          "The requirement block was archived successfully"
        )
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        delete :destroy, params: { id: block_to_destroy.id }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end

  describe "POST #restore" do
    let!(:discarded_block) do
      create(:requirement_block, discarded_at: Time.now)
    end

    context "when the requirement block is successfully restored" do
      it "restores the requirement block and returns a success response" do
        post :restore, params: { id: discarded_block.id }

        expect(discarded_block.reload.discarded?).to be_falsey
        expect(response).to have_http_status(:success)
        expect(json_response["data"]["id"]).to eq(discarded_block.id)
        expect(json_response["meta"]["message"]["message"]).to eq(
          "The requirement block was restored successfully"
        )
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        post :restore, params: { id: discarded_block.id }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end

  describe "GET #auto_compliance_module_configurations" do
    let(:available_configurations) { %w[Config1 Config2 Config3] }

    before do
      allow(AutomatedComplianceConfigurationService).to receive(
        :available_module_configurations
      ).and_return(available_configurations)
    end

    context "when the user is authorized" do
      it "returns the available module configurations" do
        get :auto_compliance_module_configurations

        expect(response).to have_http_status(:success)
        expect(json_response["data"]).to eq(available_configurations)
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        get :auto_compliance_module_configurations

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end
end

require "rails_helper"

RSpec.describe Api::TagsController, type: :controller do
  let(:super_admin) { create(:user, :super_admin) }

  before { sign_in super_admin }

  describe "POST #index" do
    it "returns matching tag names by prefix and taggable type" do
      block = create(:requirement_block)
      block.association_list.add("alphaTag")
      block.save!

      post :index,
           params: {
             search: {
               query: "alpha",
               taggable_types: ["RequirementBlock"]
             }
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to include("alphaTag")
    end
  end
end

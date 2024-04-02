require "rails_helper"

RSpec.describe Api::Concerns::Search::JurisdictionUsers, type: :controller do
  # This assumes you have a dummy controller for testing the concern
  controller(Api::ApplicationController) { include Api::Concerns::Search::JurisdictionUsers }

  let(:jurisdiction) { create(:sub_district) }
  let!(:review_managers) { create_list(:user, 5, :review_manager, jurisdiction: jurisdiction) }
  let!(:unexpected_users) { create_list(:user, 5, :reviewer, jurisdiction: jurisdiction) }
  let(:super_admin) { create(:user, :super_admin) }
  let(:current_user) { super_admin }

  before do
    allow(controller).to receive(:current_user).and_return(current_user)
    allow(controller).to receive(:authorize).and_return(true)
    allow(controller).to receive(:user_search_params).and_return(user_search_params)
    allow(controller).to receive(:params).and_return(user_search_params)

    controller.instance_variable_set(:@jurisdiction, jurisdiction)
    User.reindex
  end

  describe "perform_user_search" do
    context "when searching with a specific query" do
      let(:user_search_params) { { query: "", page: 1, per_page: 10, jurisdiction_id: jurisdiction.id } }

      it "returns only the review managers and not the reviewers" do
        controller.perform_user_search
        expect(controller.instance_variable_get(:@user_search).results).to match_array(review_managers)
      end
    end

    # Additional tests for other scenarios: different roles, pagination, ordering...
  end
end

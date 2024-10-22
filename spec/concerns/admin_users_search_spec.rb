require "rails_helper"

RSpec.describe Api::Concerns::Search::AdminUsers, type: :controller do
  # This assumes you have a dummy controller for testing the concern
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::AdminUsers
  end

  let(:jurisdiction) { create(:sub_district) }
  let(:another_jurisdiction) { create(:sub_district) }
  let!(:super_admins) { create_list(:user, 4, :super_admin) }
  let!(:review_managers) do
    create_list(:user, 4, :review_manager, jurisdiction: jurisdiction)
  end
  let!(:reviewers) do
    create_list(:user, 4, :reviewer, jurisdiction: jurisdiction)
  end
  let!(:submitters) { create_list(:user, 4, :submitter) }
  let!(:other_review_managers) do
    create_list(:user, 4, :review_manager, jurisdiction: another_jurisdiction)
  end
  let!(:other_reviewers) do
    create_list(:user, 4, :reviewer, jurisdiction: another_jurisdiction)
  end

  before do
    allow(controller).to receive(:current_user).and_return(cur_user)
    allow(controller).to receive(:authorize).and_return(true)
    allow(controller).to receive(:user_search_params).and_return(
      user_search_params
    )
    allow(controller).to receive(:params).and_return(user_search_params)
    User.reindex
  end

  describe "perform_user_search" do
    context "when searching with a specific query" do
      let(:cur_user) { create(:user, :super_admin) }
      let(:user_search_params) { { query: "", page: 1, per_page: 10 } }

      it "returns only the super_admins for super_admin" do
        controller.perform_user_search
        expect(
          controller.instance_variable_get(:@user_search).results
        ).to match_array(super_admins + [cur_user])
      end
    end

    context "when attempting the search as a reviewer user role" do
      let(:cur_user) { create(:user, :reviewer, jurisdiction: jurisdiction) }
      let(:user_search_params) { { query: "", page: 1, per_page: 10 } }

      it "does not return a search for reviewer" do
        controller.perform_user_search
        expect(
          controller.instance_variable_get(:@user_search).results
        ).to be_empty
      end
    end

    context "when attempting the search as a submitter user role" do
      let(:cur_user) { create(:user, :submitter) }
      let(:user_search_params) { { query: "", page: 1, per_page: 10 } }

      it "does not return a search for submitter" do
        controller.perform_user_search
        expect(
          controller.instance_variable_get(:@user_search).results
        ).to be_empty
      end
    end

    context "when attempting the search as a review_manager user role" do
      let(:cur_user) do
        create(:user, :review_manager, jurisdiction: jurisdiction)
      end
      let(:user_search_params) { { query: "", page: 1, per_page: 10 } }

      it "does not return a search for review_manager" do
        controller.perform_user_search
        expect(
          controller.instance_variable_get(:@user_search).results
        ).to be_empty
      end
    end

    context "when attempting the search without a current_user (logged out)" do
      let(:cur_user) { nil }
      let(:user_search_params) do
        { query: "", page: 1, per_page: 10, jurisdiction_id: jurisdiction.id }
      end

      it "does not perform the search and/or redirects to login" do
        expect(controller.instance_variable_get(:@user_search)).to be_nil
      end
    end

    # Additional tests for other scenarios: different roles, pagination, ordering...
  end
end

require "rails_helper"

RSpec.describe Api::Concerns::Search::ProjectMemberships, type: :controller do
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::ProjectMemberships
  end

  let(:owner) do
    create(:user, :submitter, first_name: "Olivia", last_name: "Owner")
  end
  let(:architect) do
    create(:user, :submitter, first_name: "Mina", last_name: "Member")
  end
  let(:builder) do
    create(:user, :submitter, first_name: "Bo", last_name: "Builder")
  end
  let(:project) { create(:permit_project, owner: owner) }
  let(:other_project) { create(:permit_project, owner: owner) }
  let!(:architect_membership) do
    membership =
      create(
        :project_membership,
        user: architect,
        permit_project: project,
        access: :full
      )
    membership.role_list = ["Architect"]
    membership.save!
    membership
  end
  let!(:builder_membership) do
    membership =
      create(
        :project_membership,
        user: builder,
        permit_project: project,
        access: :standard
      )
    membership.role_list = ["Builder"]
    membership.save!
    membership
  end
  let!(:other_membership) do
    create(
      :project_membership,
      permit_project: other_project,
      user: create(:user, :submitter, first_name: "Other", last_name: "Project")
    )
  end

  before do
    allow(controller).to receive(:project_membership_search_params).and_return(
      search_params
    )
    controller.instance_variable_set(:@permit_project, project)
    User.reindex
    ProjectMembership.reindex
  end

  describe "perform_project_membership_search" do
    context "when the query is blank" do
      let(:search_params) { { query: "", page: 1, per_page: 10 } }

      it "returns this project's memberships and matches the owner" do
        controller.perform_project_membership_search

        expect(controller.include_project_owner?).to be true
        expect(
          controller.instance_variable_get(:@project_membership_search).results
        ).to contain_exactly(architect_membership, builder_membership)
        expect(
          controller.instance_variable_get(:@project_membership_search).results
        ).not_to include(other_membership)
      end
    end

    context "when the query matches a member name" do
      let(:search_params) { { query: "Mina", page: 1, per_page: 10 } }

      it "returns that member and not the owner" do
        controller.perform_project_membership_search

        expect(controller.include_project_owner?).to be false
        expect(
          controller.instance_variable_get(:@project_membership_search).results
        ).to contain_exactly(architect_membership)
      end
    end

    context "when the query matches the owner name" do
      let(:search_params) { { query: "Olivia", page: 1, per_page: 10 } }

      it "matches the owner and no memberships" do
        controller.perform_project_membership_search

        expect(controller.include_project_owner?).to be true
        expect(
          controller.instance_variable_get(:@project_membership_search).results
        ).to be_empty
      end
    end

    context "when filtering by access" do
      let(:search_params) do
        { query: "", page: 1, per_page: 10, filters: { access: ["full"] } }
      end

      it "returns members with that access and skips the owner" do
        controller.perform_project_membership_search

        expect(controller.include_project_owner?).to be false
        expect(
          controller.instance_variable_get(:@project_membership_search).results
        ).to contain_exactly(architect_membership)
      end
    end

    context "when filtering by role" do
      let(:search_params) do
        {
          query: "",
          page: 1,
          per_page: 10,
          filters: {
            role_tags: ["Builder"]
          }
        }
      end

      it "returns members tagged with that role" do
        controller.perform_project_membership_search

        expect(controller.include_project_owner?).to be false
        expect(
          controller.instance_variable_get(:@project_membership_search).results
        ).to contain_exactly(builder_membership)
      end
    end
  end
end

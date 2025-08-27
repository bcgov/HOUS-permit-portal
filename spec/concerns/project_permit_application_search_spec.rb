require "rails_helper"

RSpec.describe Api::Concerns::Search::ProjectPermitApplications,
               type: :controller,
               search: true do
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::ProjectPermitApplications
  end

  let(:jurisdiction) { create(:sub_district) }
  let(:other_jurisdiction) { create(:sub_district) }

  let!(:owner) { create(:user, :submitter) }
  let!(:submitter) { create(:user, :submitter) }
  let!(:collaborator_user) { create(:user, :submitter) }
  let!(:reviewer) { create(:user, :reviewer, jurisdiction:) }
  let!(:unrelated_nonreview_user) { create(:user, :submitter) }

  let!(:project) { create(:permit_project, jurisdiction:, owner: owner) }

  let!(:other_project) do
    create(:permit_project, jurisdiction: other_jurisdiction, owner: submitter)
  end

  let!(:p1_draft) do
    create(:permit_application, submitter:, permit_project: project)
  end

  let!(:p2_sub) do
    create(
      :permit_application,
      :newly_submitted,
      submitter:,
      permit_project: project
    )
  end

  let!(:p3_resub) do
    create(
      :permit_application,
      :resubmitted,
      submitter:,
      permit_project: project
    )
  end

  let!(:other_proj_app) do
    create(:permit_application, :newly_submitted, permit_project: other_project)
  end

  before do
    allow(controller).to receive(:authorize).and_return(true)
    allow(controller).to receive(:params).and_return(
      ActionController::Parameters.new(
        { id: project.id, query: "", page: 1, per_page: 50 }
      )
    )
    controller.instance_variable_set(:@permit_project, project)

    User.reindex
    PermitApplication.reindex
  end

  it "as project owner returns all project applications" do
    allow(controller).to receive(:current_user).and_return(owner)
    controller.perform_permit_application_search
    ids =
      controller
        .instance_variable_get(:@permit_application_search)
        .results
        .map(&:id)
    expect(ids).to match_array([p1_draft.id, p2_sub.id, p3_resub.id])
  end

  it "as submission collaborator returns only collaborated apps" do
    # add collaborator_user as submission collaborator on p2_sub
    collaborator =
      create(
        :collaborator,
        user: collaborator_user,
        collaboratorable: submitter
      )
    create(
      :permit_collaboration,
      :submission,
      :delegatee,
      collaborator:,
      permit_application: p1_draft
    )

    allow(controller).to receive(:current_user).and_return(collaborator_user)
    controller.perform_permit_application_search
    ids =
      controller
        .instance_variable_get(:@permit_application_search)
        .results
        .map(&:id)
    expect(ids).to match_array([p1_draft.id])
  end

  it "as unrelated submitter sees nothing under someone else's project" do
    unrelated = create(:user, :submitter)
    allow(controller).to receive(:current_user).and_return(unrelated)
    controller.perform_permit_application_search
    ids =
      controller
        .instance_variable_get(:@permit_application_search)
        .results
        .map(&:id)
    expect(ids).to be_empty
  end

  it "as reviewer does not see draft apps under project list (only submitted within jurisdiction)" do
    allow(controller).to receive(:current_user).and_return(reviewer)
    controller.perform_permit_application_search
    ids =
      controller
        .instance_variable_get(:@permit_application_search)
        .results
        .map(&:id)
    expect(ids).to match_array([p2_sub.id, p3_resub.id])
    expect(ids).not_to include(p1_draft.id)
  end

  it "as unrelated non-review user sees only their own submissions (none here)" do
    allow(controller).to receive(:current_user).and_return(
      unrelated_nonreview_user
    )
    controller.perform_permit_application_search
    ids =
      controller
        .instance_variable_get(:@permit_application_search)
        .results
        .map(&:id)
    expect(ids).to be_empty
  end
end

require "rails_helper"

RSpec.describe Api::Concerns::Search::JurisdictionPermitApplications,
               type: :controller,
               search: true do
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::JurisdictionPermitApplications
  end

  let(:jurisdiction) { create(:sub_district) }
  let(:other_jurisdiction) { create(:sub_district) }
  let!(:submitter) { create(:user, :submitter) }
  let!(:other_submitter) { create(:user, :submitter) }
  let!(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let!(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let!(:other_reviewer) do
    create(:user, :reviewer, jurisdiction: other_jurisdiction)
  end
  let!(:unrelated_user) { create(:user, :submitter) }

  let!(:draft_pas) do
    create_list(
      :permit_application,
      2,
      submitter: submitter,
      jurisdiction: jurisdiction,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:revisions_requested_pas) do
    create_list(
      :permit_application,
      2,
      :revisions_requested,
      submitter: submitter,
      jurisdiction: jurisdiction,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:submitted_pas) do
    create_list(
      :permit_application,
      2,
      :newly_submitted,
      submitter: submitter,
      jurisdiction: jurisdiction,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:resubmitted_pas) do
    create_list(
      :permit_application,
      2,
      :resubmitted,
      submitter: submitter,
      jurisdiction: jurisdiction,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:submitted_other_jur) do
    create_list(
      :permit_application,
      2,
      :newly_submitted,
      submitter: submitter,
      jurisdiction: other_jurisdiction,
      permit_project:
        create(
          :permit_project,
          jurisdiction: other_jurisdiction,
          owner: submitter
        )
    )
  end

  before do
    allow(controller).to receive(:authorize).and_return(true)
    controller.instance_variable_set(:@jurisdiction, jurisdiction)
    allow(controller).to receive(:params).and_return(
      ActionController::Parameters.new(
        { id: jurisdiction.id, query: "", page: 1, per_page: 50 }
      )
    )
    User.reindex
    PermitApplication.reindex
    PermitApplication.search_index.refresh
  end

  it "as reviewer returns only submitted apps in jurisdiction" do
    allow(controller).to receive(:current_user).and_return(reviewer)
    controller.perform_permit_application_search
    results = controller.instance_variable_get(:@permit_application_search)
    ids = results.results.map(&:id)
    expect(ids).to match_array((submitted_pas + resubmitted_pas).map(&:id))
    # explicit negatives
    expect(ids).not_to include(*draft_pas.map(&:id))
    expect(ids).not_to include(*revisions_requested_pas.map(&:id))
    expect(ids).not_to include(*submitted_other_jur.map(&:id))
  end

  it "as review manager returns only submitted apps in jurisdiction" do
    allow(controller).to receive(:current_user).and_return(review_manager)
    controller.perform_permit_application_search
    results = controller.instance_variable_get(:@permit_application_search)
    ids = results.results.map(&:id)
    expect(ids).to match_array((submitted_pas + resubmitted_pas).map(&:id))
  end

  it "as reviewer searching a different jurisdiction sees only that jurisdiction's submitted apps" do
    allow(controller).to receive(:current_user).and_return(other_reviewer)
    controller.instance_variable_set(:@jurisdiction, other_jurisdiction)
    allow(controller).to receive(:params).and_return(
      ActionController::Parameters.new(
        { id: other_jurisdiction.id, query: "", page: 1, per_page: 50 }
      )
    )
    controller.perform_permit_application_search
    results = controller.instance_variable_get(:@permit_application_search)
    ids = results.results.map(&:id)
    expect(ids).to match_array(submitted_other_jur.map(&:id))
    expect(ids).not_to include(*submitted_pas.map(&:id))
  end

  it "as unrelated non-review user with no apps sees nothing" do
    allow(controller).to receive(:current_user).and_return(unrelated_user)
    controller.perform_permit_application_search
    results = controller.instance_variable_get(:@permit_application_search)
    ids = results.results.map(&:id)
    expect(ids).to be_empty
  end

  it "as submitter sees their own apps in jurisdiction (including drafts)" do
    allow(controller).to receive(:current_user).and_return(submitter)
    controller.perform_permit_application_search
    results = controller.instance_variable_get(:@permit_application_search)
    ids = results.results.map(&:id)
    expect(ids).to match_array(
      (
        draft_pas + revisions_requested_pas + submitted_pas + resubmitted_pas
      ).map(&:id)
    )
  end
end

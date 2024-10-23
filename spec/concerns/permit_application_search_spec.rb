require "rails_helper"

RSpec.describe Api::Concerns::Search::PermitApplications, type: :controller do
  # This assumes you have a dummy controller for testing the concern
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::PermitApplications
  end

  let(:jurisdiction) { create(:sub_district) }
  let(:other_jurisdiction) { create(:sub_district) }
  let!(:super_admin) { create(:user, :super_admin) }
  let!(:submitter) { create(:user, :submitter) }
  let!(:other_submitter) { create(:user, :submitter) }
  let!(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let!(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }

  let!(:other_review_manager) do
    create(:user, :review_manager, jurisdiction: other_jurisdiction)
  end
  let!(:other_reviewer) do
    create(:user, :reviewer, jurisdiction: other_jurisdiction)
  end

  let!(:draft_permit_applications) do
    create_list(
      :permit_application,
      3,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  let!(:revisions_requested_permit_applications) do
    create_list(
      :permit_application,
      3,
      :revisions_requested,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  let!(:submitted_permit_applications) do
    create_list(
      :permit_application,
      3,
      :newly_submitted,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  let!(:resubmitted_permit_applications) do
    create_list(
      :permit_application,
      3,
      :resubmitted,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  let!(:submitted_permit_applications_different_jur) do
    create_list(
      :permit_application,
      3,
      :newly_submitted,
      submitter: submitter,
      jurisdiction: other_jurisdiction
    )
  end

  let!(:resubmitted_permit_applications_different_jur) do
    create_list(
      :permit_application,
      3,
      :resubmitted,
      submitter: submitter,
      jurisdiction: other_jurisdiction
    )
  end

  let!(:other_permit_applications_same_jur) do
    create_list(
      :permit_application,
      3,
      submitter: other_submitter,
      jurisdiction: jurisdiction
    )
  end

  let!(:other_permit_applications_different_jur) do
    create_list(
      :permit_application,
      3,
      submitter: other_submitter,
      jurisdiction: other_jurisdiction
    )
  end

  before do
    allow(controller).to receive(:current_user).and_return(cur_user)
    allow(controller).to receive(:authorize).and_return(true)
    allow(controller).to receive(:permit_application_search_params).and_return(
      permit_application_search_params
    )
    allow(controller).to receive(:params).and_return(
      permit_application_search_params
    )
    User.reindex
    PermitApplication.reindex
  end

  describe "perform_permit_application_search" do
    context "when searching for the users permit applications" do
      let(:cur_user) { submitter }
      let(:permit_application_search_params) do
        { query: "", page: 1, per_page: 20 }
      end

      it "returns only own permit applications" do
        controller.perform_permit_application_search
        expect(
          controller.instance_variable_get(:@permit_application_search).results
        ).to match_array(
          draft_permit_applications + submitted_permit_applications +
            resubmitted_permit_applications +
            revisions_requested_permit_applications +
            submitted_permit_applications_different_jur +
            resubmitted_permit_applications_different_jur
        )
      end
    end

    context "when searching for the jurisdictions permit applications as a reviewer" do
      before { controller.instance_variable_set(:@jurisdiction, jurisdiction) }

      let(:cur_user) { reviewer }
      let(:permit_application_search_params) do
        { query: "", page: 1, per_page: 20 }
      end

      it "returns only own jurisdictions permit applications" do
        controller.perform_permit_application_search
        expect(
          controller.instance_variable_get(:@permit_application_search).results
        ).to match_array(
          submitted_permit_applications + resubmitted_permit_applications
        )
      end
    end

    context "when searching for the jurisdictions permit applications as a review manager" do
      before { controller.instance_variable_set(:@jurisdiction, jurisdiction) }

      let(:cur_user) { review_manager }
      let(:permit_application_search_params) do
        { query: "", page: 1, per_page: 20 }
      end

      it "returns only own jurisdictions permit applications" do
        controller.perform_permit_application_search
        expect(
          controller.instance_variable_get(:@permit_application_search).results
        ).to match_array(
          submitted_permit_applications + resubmitted_permit_applications
        )
      end
    end

    # Additional tests for other scenarios: different roles, pagination, ordering...
  end
end

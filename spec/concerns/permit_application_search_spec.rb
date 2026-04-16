require "rails_helper"

RSpec.describe Api::Concerns::Search::JurisdictionPermitApplications,
               type: :controller,
               search: true do
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::JurisdictionPermitApplications
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
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:revisions_requested_permit_applications) do
    create_list(
      :permit_application,
      3,
      :revisions_requested,
      submitter: submitter,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:submitted_permit_applications) do
    create_list(
      :permit_application,
      3,
      :newly_submitted,
      submitter: submitter,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:resubmitted_permit_applications) do
    create_list(
      :permit_application,
      3,
      :resubmitted,
      submitter: submitter,
      permit_project:
        create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    )
  end

  let!(:submitted_permit_applications_different_jur) do
    create_list(
      :permit_application,
      3,
      :newly_submitted,
      submitter: submitter,
      permit_project:
        create(
          :permit_project,
          jurisdiction: other_jurisdiction,
          owner: submitter
        )
    )
  end

  let!(:resubmitted_permit_applications_different_jur) do
    create_list(
      :permit_application,
      3,
      :resubmitted,
      submitter: submitter,
      permit_project:
        create(
          :permit_project,
          jurisdiction: other_jurisdiction,
          owner: submitter
        )
    )
  end

  let!(:other_permit_applications_same_jur) do
    create_list(
      :permit_application,
      3,
      submitter: other_submitter,
      permit_project:
        create(
          :permit_project,
          jurisdiction: jurisdiction,
          owner: other_submitter
        )
    )
  end

  let!(:other_permit_applications_different_jur) do
    create_list(
      :permit_application,
      3,
      submitter: other_submitter,
      permit_project:
        create(
          :permit_project,
          jurisdiction: other_jurisdiction,
          owner: other_submitter
        )
    )
  end

  before do
    allow(controller).to receive(:current_user).and_return(cur_user)
    allow(controller).to receive(:authorize).and_return(true)
    allow(controller).to receive(
      :jurisdiction_permit_application_search_params
    ).and_return(jurisdiction_permit_application_search_params)
    allow(controller).to receive(:params).and_return(
      jurisdiction_permit_application_search_params
    )
    User.reindex
    PermitApplication.reindex
  end

  describe "perform_jurisdiction_permit_application_search" do
    context "when searching for the jurisdictions permit applications as a reviewer" do
      before { controller.instance_variable_set(:@jurisdiction, jurisdiction) }

      let(:cur_user) { reviewer }
      let(:jurisdiction_permit_application_search_params) do
        { query: "", page: 1, per_page: 20 }
      end

      it "returns only own jurisdictions permit applications" do
        controller.perform_jurisdiction_permit_application_search
        expect(
          controller.instance_variable_get(
            :@jurisdiction_permit_application_search
          ).results
        ).to match_array(
          submitted_permit_applications + resubmitted_permit_applications +
            revisions_requested_permit_applications
        )
      end
    end

    context "when searching for the jurisdictions permit applications as a review manager" do
      before { controller.instance_variable_set(:@jurisdiction, jurisdiction) }

      let(:cur_user) { review_manager }
      let(:jurisdiction_permit_application_search_params) do
        { query: "", page: 1, per_page: 20 }
      end

      it "returns only own jurisdictions permit applications" do
        controller.perform_jurisdiction_permit_application_search
        expect(
          controller.instance_variable_get(
            :@jurisdiction_permit_application_search
          ).results
        ).to match_array(
          submitted_permit_applications + resubmitted_permit_applications +
            revisions_requested_permit_applications
        )
      end
    end

    context "days_in_queue filter and sort" do
      before do
        controller.instance_variable_set(:@jurisdiction, jurisdiction)

        submitted_permit_applications.each do |pa|
          pa.update_columns(
            queue_time_seconds: 0,
            queue_clock_started_at: 15.days.ago
          )
        end
        resubmitted_permit_applications.each do |pa|
          pa.update_columns(
            queue_time_seconds: 0,
            queue_clock_started_at: 3.days.ago
          )
        end
        revisions_requested_permit_applications.each do |pa|
          pa.update_columns(
            queue_time_seconds: 7 * 86_400,
            queue_clock_started_at: nil
          )
        end

        PermitApplication.reindex
      end

      let(:cur_user) { reviewer }

      context "gte filter" do
        let(:jurisdiction_permit_application_search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            filters: {
              days_in_queue: {
                operator: "gte",
                days: "10"
              }
            }
          }
        end

        it "returns applications with 10 or more days in queue" do
          controller.perform_jurisdiction_permit_application_search
          results =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_search
            ).results

          expect(results).to match_array(submitted_permit_applications)
        end
      end

      context "lt filter" do
        let(:jurisdiction_permit_application_search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            filters: {
              days_in_queue: {
                operator: "lt",
                days: "5"
              }
            }
          }
        end

        it "returns applications with less than 5 days in queue" do
          controller.perform_jurisdiction_permit_application_search
          results =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_search
            ).results

          expect(results).to match_array(resubmitted_permit_applications)
        end
      end

      context "banked time filter" do
        let(:jurisdiction_permit_application_search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            filters: {
              days_in_queue: {
                operator: "gte",
                days: "5"
              }
            }
          }
        end

        it "includes applications with banked time even when clock is paused" do
          controller.perform_jurisdiction_permit_application_search
          results =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_search
            ).results

          expect(results).to include(*submitted_permit_applications)
          expect(results).to include(*revisions_requested_permit_applications)
          expect(results).not_to include(*resubmitted_permit_applications)
        end
      end

      context "sort by days_in_queue descending" do
        let(:jurisdiction_permit_application_search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            sort: {
              field: "days_in_queue",
              direction: "desc"
            }
          }
        end

        it "returns applications sorted by total queue time descending" do
          controller.perform_jurisdiction_permit_application_search
          results =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_search
            ).results

          submitted_ids = submitted_permit_applications.map(&:id)
          revisions_ids = revisions_requested_permit_applications.map(&:id)
          resubmitted_ids = resubmitted_permit_applications.map(&:id)

          result_ids = results.map(&:id)
          first_submitted_idx =
            result_ids.index { |id| submitted_ids.include?(id) }
          first_revisions_idx =
            result_ids.index { |id| revisions_ids.include?(id) }
          first_resubmitted_idx =
            result_ids.index { |id| resubmitted_ids.include?(id) }

          expect(first_submitted_idx).to be < first_revisions_idx
          expect(first_revisions_idx).to be < first_resubmitted_idx
        end
      end

      context "sort by days_in_queue ascending" do
        let(:jurisdiction_permit_application_search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            sort: {
              field: "days_in_queue",
              direction: "asc"
            }
          }
        end

        it "returns applications sorted by total queue time ascending" do
          controller.perform_jurisdiction_permit_application_search
          results =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_search
            ).results

          submitted_ids = submitted_permit_applications.map(&:id)
          resubmitted_ids = resubmitted_permit_applications.map(&:id)

          result_ids = results.map(&:id)
          first_resubmitted_idx =
            result_ids.index { |id| resubmitted_ids.include?(id) }
          first_submitted_idx =
            result_ids.index { |id| submitted_ids.include?(id) }

          expect(first_resubmitted_idx).to be < first_submitted_idx
        end
      end
    end

    context "when permit_project_id scopes search and status_counts" do
      before { controller.instance_variable_set(:@jurisdiction, jurisdiction) }

      let(:cur_user) { reviewer }
      let(:target_project) do
        submitted_permit_applications.first.permit_project
      end

      let(:jurisdiction_permit_application_search_params) do
        {
          query: "",
          page: 1,
          per_page: 50,
          permit_project_id: target_project.id
        }
      end

      it "returns only applications for that permit project" do
        controller.perform_jurisdiction_permit_application_search
        results =
          controller.instance_variable_get(
            :@jurisdiction_permit_application_search
          ).results
        expect(results.map(&:permit_project_id).uniq).to eq([target_project.id])
        expect(results).to match_array(submitted_permit_applications)
      end

      it "scopes status_counts in meta to that permit project" do
        controller.perform_jurisdiction_permit_application_search
        meta =
          controller.instance_variable_get(
            :@jurisdiction_permit_application_meta
          )
        # Regression: status_counts must use the same permit_project scope as the
        # list search (not jurisdiction-wide aggregates).
        expect(meta[:status_counts].values.sum).to eq(meta[:total_count])
      end

      it "scopes unread_count in meta to that permit project" do
        controller.perform_jurisdiction_permit_application_search
        meta =
          controller.instance_variable_get(
            :@jurisdiction_permit_application_meta
          )
        # All submitted apps belong to the target_project and are unread
        # (newly_submitted, no viewed_at). The unread count should be scoped
        # to the project, not jurisdiction-wide.
        expect(meta[:unread_count]).to eq(submitted_permit_applications.size)
      end
    end

    context "unread_count in meta" do
      before { controller.instance_variable_set(:@jurisdiction, jurisdiction) }

      let(:cur_user) { reviewer }

      context "base jurisdiction-wide query" do
        let(:jurisdiction_permit_application_search_params) do
          { query: "", page: 1, per_page: 50 }
        end

        it "counts unread submitted/resubmitted/revisions_requested apps in the jurisdiction" do
          controller.perform_jurisdiction_permit_application_search
          meta =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_meta
            )

          # new_draft apps are excluded; other-jurisdiction apps are excluded.
          expected_unread =
            submitted_permit_applications.size +
              resubmitted_permit_applications.size +
              revisions_requested_permit_applications.size
          expect(meta[:unread_count]).to eq(expected_unread)
        end
      end

      context "when filters would narrow the list" do
        let(:jurisdiction_permit_application_search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            filters: {
              status: ["newly_submitted"]
            }
          }
        end

        it "remains jurisdiction-wide and ignores current filters" do
          controller.perform_jurisdiction_permit_application_search
          meta =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_meta
            )

          expected_unread =
            submitted_permit_applications.size +
              resubmitted_permit_applications.size +
              revisions_requested_permit_applications.size
          expect(meta[:unread_count]).to eq(expected_unread)
        end
      end

      context "kanban mode" do
        let(:jurisdiction_permit_application_search_params) do
          { query: "", mode: "kanban", per_column: 10 }
        end

        it "populates unread_count jurisdiction-wide" do
          controller.perform_jurisdiction_permit_application_search
          meta =
            controller.instance_variable_get(
              :@jurisdiction_permit_application_meta
            )

          expected_unread =
            submitted_permit_applications.size +
              resubmitted_permit_applications.size +
              revisions_requested_permit_applications.size
          expect(meta).to include(:unread_count)
          expect(meta[:unread_count]).to eq(expected_unread)
        end
      end
    end
  end
end

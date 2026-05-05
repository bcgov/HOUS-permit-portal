require "rails_helper"

RSpec.describe Api::Concerns::Search::JurisdictionPermitProjects,
               type: :controller,
               search: true do
  controller(Api::ApplicationController) do
    include Api::Concerns::Search::JurisdictionPermitProjects
  end

  let(:jurisdiction) { create(:sub_district) }
  let(:other_jurisdiction) { create(:sub_district) }
  let!(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let!(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let!(:submitter) { create(:user, :submitter) }

  let(:permit_type_a) { create(:permit_type) }
  let(:permit_type_b) { create(:permit_type) }
  let(:activity) { create(:activity) }

  let!(:template_a) do
    create(
      :live_requirement_template,
      permit_type: permit_type_a,
      activity: activity
    )
  end

  let!(:template_b) do
    create(
      :live_requirement_template,
      permit_type: permit_type_b,
      activity: activity
    )
  end

  let!(:template_version_a) do
    create(
      :template_version,
      requirement_template: template_a,
      status: "published",
      form_json: template_a.to_form_json
    )
  end

  let!(:template_version_b) do
    create(
      :template_version,
      requirement_template: template_b,
      status: "published",
      form_json: template_b.to_form_json
    )
  end

  let!(:project_a) do
    create(
      :permit_project,
      jurisdiction: jurisdiction,
      owner: submitter,
      state: :queued,
      enqueued_at: 10.days.ago,
      viewed_at: nil
    )
  end

  let!(:project_b) do
    create(
      :permit_project,
      jurisdiction: jurisdiction,
      owner: submitter,
      state: :in_progress,
      enqueued_at: 2.days.ago
    )
  end

  let!(:project_c) do
    create(
      :permit_project,
      jurisdiction: jurisdiction,
      owner: submitter,
      state: :queued,
      enqueued_at: 20.days.ago,
      viewed_at: nil
    )
  end

  let!(:draft_project) do
    create(
      :permit_project,
      jurisdiction: jurisdiction,
      owner: submitter,
      state: :draft
    )
  end

  let!(:other_jurisdiction_project) do
    create(
      :permit_project,
      jurisdiction: other_jurisdiction,
      owner: submitter,
      state: :queued,
      enqueued_at: 5.days.ago
    )
  end

  let!(:contact_a) do
    create(
      :permit_type_submission_contact,
      jurisdiction: jurisdiction,
      permit_type: permit_type_a
    )
  end

  let!(:contact_b) do
    create(
      :permit_type_submission_contact,
      jurisdiction: jurisdiction,
      permit_type: permit_type_b
    )
  end

  let!(:app_a) do
    create(
      :permit_application,
      :newly_submitted,
      submitter: submitter,
      permit_project: project_a,
      template_version: template_version_a,
      permit_type: permit_type_a,
      activity: activity
    )
  end

  let!(:app_b) do
    create(
      :permit_application,
      :newly_submitted,
      submitter: submitter,
      permit_project: project_b,
      template_version: template_version_b,
      permit_type: permit_type_b,
      activity: activity
    )
  end

  let!(:app_c) do
    create(
      :permit_application,
      :newly_submitted,
      submitter: submitter,
      permit_project: project_c,
      template_version: template_version_a,
      permit_type: permit_type_a,
      activity: activity
    )
  end

  before do
    allow(controller).to receive(:current_user).and_return(cur_user)
    allow(controller).to receive(:authorize).and_return(true)
    allow(controller).to receive(:policy_scope).and_return(PermitProject.all)
    allow(controller).to receive(
      :jurisdiction_permit_project_search_params
    ).and_return(search_params)
    allow(controller).to receive(:params).and_return(search_params)
    controller.instance_variable_set(:@jurisdiction, jurisdiction)

    project_b.update_column(:viewed_at, Time.current)

    project_a.update_columns(
      queue_time_seconds: 0,
      queue_clock_started_at: 10.days.ago
    )
    project_b.update_columns(
      queue_time_seconds: 0,
      queue_clock_started_at: 2.days.ago
    )
    project_c.update_columns(
      queue_time_seconds: 0,
      queue_clock_started_at: 20.days.ago
    )

    PermitProject.reindex
    PermitApplication.reindex
  end

  let(:cur_user) { review_manager }
  let(:search_params) { { query: "", page: 1, per_page: 50 } }

  def perform_search
    controller.perform_jurisdiction_permit_project_search
  end

  def search_result_ids
    controller.instance_variable_get(:@jurisdiction_permit_projects).map(&:id)
  end

  describe "#perform_jurisdiction_permit_project_search" do
    context "base behavior" do
      it "returns non-draft projects in the jurisdiction" do
        perform_search
        ids = search_result_ids

        expect(ids).to include(project_a.id, project_b.id, project_c.id)
        expect(ids).not_to include(draft_project.id)
        expect(ids).not_to include(other_jurisdiction_project.id)
      end

      it "populates meta with pagination and state_counts" do
        perform_search
        meta =
          controller.instance_variable_get(:@jurisdiction_permit_project_meta)

        expect(meta).to include(
          :total_pages,
          :current_page,
          :total_count,
          :state_counts,
          :unread_count
        )
        expect(meta[:total_count]).to eq(3)
      end

      it "populates meta with unread_count for all unread projects in the jurisdiction" do
        perform_search
        meta =
          controller.instance_variable_get(:@jurisdiction_permit_project_meta)

        expect(meta[:unread_count]).to eq(2)
      end
    end

    context "unread_count in meta" do
      it "excludes draft projects and other-jurisdiction projects" do
        perform_search
        meta =
          controller.instance_variable_get(:@jurisdiction_permit_project_meta)

        expect(meta[:unread_count]).to eq(2)
      end

      context "when filters would narrow the list" do
        let(:search_params) do
          {
            query: "",
            page: 1,
            per_page: 50,
            filters: {
              state: ["in_progress"]
            }
          }
        end

        it "still reflects jurisdiction-wide unread count (ignores current filters)" do
          perform_search
          meta =
            controller.instance_variable_get(:@jurisdiction_permit_project_meta)

          expect(meta[:unread_count]).to eq(2)
        end
      end

      context "when unread filter hides unread" do
        let(:search_params) do
          { query: "", page: 1, per_page: 50, filters: { unread: "hide" } }
        end

        it "still reflects jurisdiction-wide unread count (ignores unread filter)" do
          perform_search
          meta =
            controller.instance_variable_get(:@jurisdiction_permit_project_meta)

          expect(meta[:unread_count]).to eq(2)
        end
      end

      context "when a project is marked as viewed" do
        before do
          project_a.update_column(:viewed_at, Time.current)
          PermitProject.reindex
        end

        it "reflects the updated unread count" do
          perform_search
          meta =
            controller.instance_variable_get(:@jurisdiction_permit_project_meta)

          expect(meta[:unread_count]).to eq(1)
        end
      end
    end

    context "with requirement_template_ids filter" do
      let(:search_params) do
        {
          query: "",
          page: 1,
          per_page: 50,
          filters: {
            requirement_template_ids: [template_a.id]
          }
        }
      end

      it "returns only projects whose applications use the given template" do
        perform_search
        ids = search_result_ids

        expect(ids).to include(project_a.id, project_c.id)
        expect(ids).not_to include(project_b.id)
      end
    end

    context "with state filter" do
      let(:search_params) do
        { query: "", page: 1, per_page: 50, filters: { state: ["queued"] } }
      end

      it "returns only projects matching the given state" do
        perform_search
        ids = search_result_ids

        expect(ids).to include(project_a.id, project_c.id)
        expect(ids).not_to include(project_b.id)
      end
    end

    context "with unread filter" do
      context "only_show unread" do
        let(:search_params) do
          { query: "", page: 1, per_page: 50, filters: { unread: "only_show" } }
        end

        it "returns only projects with nil viewed_at" do
          perform_search
          ids = search_result_ids

          expect(ids).to include(project_a.id, project_c.id)
          expect(ids).not_to include(project_b.id)
        end
      end

      context "hide unread" do
        let(:search_params) do
          { query: "", page: 1, per_page: 50, filters: { unread: "hide" } }
        end

        it "returns only projects with non-nil viewed_at" do
          perform_search
          ids = search_result_ids

          expect(ids).to include(project_b.id)
          expect(ids).not_to include(project_a.id, project_c.id)
        end
      end
    end

    context "with days_in_queue filter" do
      context "gte operator" do
        let(:search_params) do
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

        it "returns projects with 5 or more days in queue" do
          perform_search
          ids = search_result_ids

          expect(ids).to include(project_a.id, project_c.id)
          expect(ids).not_to include(project_b.id)
        end
      end

      context "lt operator" do
        let(:search_params) do
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

        it "returns projects with less than 5 days in queue" do
          perform_search
          ids = search_result_ids

          expect(ids).to include(project_b.id)
          expect(ids).not_to include(project_a.id, project_c.id)
        end
      end

      context "with banked time (clock paused)" do
        before do
          project_b.update_columns(
            state: PermitProject.states[:waiting],
            queue_time_seconds: 12 * 86_400,
            queue_clock_started_at: nil
          )
          PermitProject.reindex
        end

        let(:search_params) do
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

        it "includes projects with sufficient banked time even when clock is paused" do
          perform_search
          ids = search_result_ids

          expect(ids).to include(project_a.id, project_b.id, project_c.id)
        end
      end
    end

    context "sorting by days_in_queue" do
      let(:search_params) do
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

      it "sorts by total queue time descending" do
        perform_search
        ids = search_result_ids

        expect(ids.index(project_c.id)).to be < ids.index(project_a.id)
        expect(ids.index(project_a.id)).to be < ids.index(project_b.id)
      end

      context "ascending" do
        let(:search_params) do
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

        it "sorts by total queue time ascending" do
          perform_search
          ids = search_result_ids

          expect(ids.index(project_b.id)).to be < ids.index(project_a.id)
          expect(ids.index(project_a.id)).to be < ids.index(project_c.id)
        end
      end
    end

    context "with combined filters" do
      let(:search_params) do
        {
          query: "",
          page: 1,
          per_page: 50,
          filters: {
            requirement_template_ids: [template_a.id],
            unread: "only_show",
            days_in_queue: {
              operator: "gte",
              days: "15"
            }
          }
        }
      end

      it "applies all filters together" do
        perform_search
        ids = search_result_ids

        expect(ids).to eq([project_c.id])
      end
    end

    context "as a reviewer" do
      let(:cur_user) { reviewer }

      it "returns the same results as a review manager" do
        perform_search
        ids = search_result_ids

        expect(ids).to include(project_a.id, project_b.id, project_c.id)
      end
    end

    context "kanban mode" do
      let(:search_params) { { query: "", mode: "kanban", per_column: 10 } }

      it "returns projects grouped by kanban state" do
        perform_search
        ids = search_result_ids

        expect(ids).to include(project_a.id, project_b.id, project_c.id)
        expect(ids).not_to include(draft_project.id)
        expect(ids).not_to include(other_jurisdiction_project.id)
      end

      it "populates meta with column_totals" do
        perform_search
        meta =
          controller.instance_variable_get(:@jurisdiction_permit_project_meta)

        expect(meta).to include(:column_totals, :state_counts, :unread_count)
        expect(meta[:column_totals]["queued"]).to eq(2)
        expect(meta[:column_totals]["in_progress"]).to eq(1)
      end

      it "populates meta with jurisdiction-wide unread_count" do
        perform_search
        meta =
          controller.instance_variable_get(:@jurisdiction_permit_project_meta)

        expect(meta[:unread_count]).to eq(2)
      end

      it "state_counts remain unfiltered regardless of mode" do
        perform_search
        meta =
          controller.instance_variable_get(:@jurisdiction_permit_project_meta)

        total = meta[:state_counts].values.sum
        expect(total).to eq(3)
      end

      context "with per_column limit" do
        let(:search_params) { { query: "", mode: "kanban", per_column: 1 } }

        it "limits results per column" do
          perform_search
          ids = search_result_ids
          meta =
            controller.instance_variable_get(:@jurisdiction_permit_project_meta)

          queued_ids =
            ids.select { |id| [project_a.id, project_c.id].include?(id) }
          expect(queued_ids.length).to eq(1)
          expect(meta[:column_totals]["queued"]).to eq(2)
        end
      end

      context "with unread filter" do
        let(:search_params) do
          {
            query: "",
            mode: "kanban",
            per_column: 10,
            filters: {
              unread: "hide"
            }
          }
        end

        it "respects filters within each column" do
          perform_search
          ids = search_result_ids

          expect(ids).to include(project_b.id)
          expect(ids).not_to include(project_a.id, project_c.id)
        end

        it "column_totals reflect filtered counts" do
          perform_search
          meta =
            controller.instance_variable_get(:@jurisdiction_permit_project_meta)

          expect(meta[:column_totals]["queued"]).to eq(0)
          expect(meta[:column_totals]["in_progress"]).to eq(1)
        end

        it "state_counts remain unfiltered" do
          perform_search
          meta =
            controller.instance_variable_get(:@jurisdiction_permit_project_meta)

          expect(meta[:state_counts]["queued"]).to eq(2)
        end
      end
    end
  end
end

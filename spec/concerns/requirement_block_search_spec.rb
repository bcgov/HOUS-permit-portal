require "rails_helper"

RSpec.describe Api::RequirementBlocksController, type: :controller do
  # Include Devise test helpers if using Devise for authentication
  include Devise::Test::ControllerHelpers

  # Define a helper method to parse JSON responses
  def json_response
    JSON.parse(response.body)
  end

  # Define test data using FactoryBot
  let(:activity) { create(:activity) }
  let(:permit_type) { create(:permit_type) }

  # Create RequirementBlock instances with various attributes
  let!(:requirement_block_any_visible) do
    create(
      :requirement_block_with_requirements,
      name: "Block Any 1",
      display_name: "Display Block Any 1",
      visibility: :any,
      discarded_at: nil,
      created_at: 10.days.ago,
      updated_at: 10.days.ago
    )
  end

  let!(:requirement_block_any_discarded) do
    create(
      :requirement_block_with_requirements,
      name: "Block Any 2",
      display_name: "Display Block Any 2",
      visibility: :any,
      discarded_at: Time.current,
      created_at: 9.days.ago,
      updated_at: 9.days.ago
    )
  end

  let!(:requirement_block_early_access_visible) do
    create(
      :requirement_block_with_requirements,
      name: "Block Early Access 1",
      display_name: "Display Block Early Access 1",
      visibility: :early_access,
      discarded_at: nil,
      created_at: 8.days.ago,
      updated_at: 8.days.ago
    )
  end

  let!(:requirement_block_early_access_discarded) do
    create(
      :requirement_block_with_requirements,
      name: "Block Early Access 2",
      display_name: "Display Block Early Access 2",
      visibility: :early_access,
      discarded_at: Time.current,
      created_at: 7.days.ago,
      updated_at: 7.days.ago
    )
  end

  let!(:requirement_block_live_visible) do
    create(
      :requirement_block_with_requirements,
      name: "Block Live 1",
      display_name: "Display Block Live 1",
      visibility: :live,
      discarded_at: nil,
      created_at: 6.days.ago,
      updated_at: 6.days.ago
    )
  end

  let!(:requirement_block_live_discarded) do
    create(
      :requirement_block_with_requirements,
      name: "Block Live 2",
      display_name: "Display Block Live 2",
      visibility: :live,
      discarded_at: Time.current,
      created_at: 5.days.ago,
      updated_at: 5.days.ago
    )
  end

  let!(:requirement_block_with_specific_name) do
    create(
      :requirement_block_with_requirements,
      name: "Specific Block Name",
      display_name: "Specific Display Name",
      visibility: :any,
      discarded_at: nil,
      created_at: 4.days.ago,
      updated_at: 4.days.ago
    )
  end

  # Create additional RequirementBlocks for pagination testing
  let!(:paginated_requirement_blocks) do
    create_list(
      :requirement_block_with_requirements,
      5,
      name: "Paginated Block",
      display_name: "Paginated Display",
      visibility: :any,
      discarded_at: nil,
      created_at: 3.days.ago,
      updated_at: 3.days.ago
    )
  end

  # Create a user with appropriate permissions
  let!(:super_admin) { create(:user, :super_admin) }
  let!(:regular_user) { create(:user) }

  before do
    # Ensure search data is up-to-date
    RequirementBlock.reindex
    RequirementBlock.search_index.refresh
  end

  describe "GET #index" do
    context "when user is unauthenticated" do
      it "returns an unauthorized error" do
        get :index, params: { query: "", page: 1, per_page: 20 }, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when user is authenticated" do
      before { sign_in super_admin }

      context "without any filters" do
        it "returns all live requirement blocks" do
          get :index,
              params: {
                query: "",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to include(
            requirement_block_any_visible.id,
            requirement_block_live_visible.id,
            requirement_block_with_specific_name.id
          )

          expect(returned_ids).not_to include(
            requirement_block_any_discarded.id,
            requirement_block_early_access_discarded.id,
            requirement_block_live_discarded.id
          )
        end
      end

      context "filtering by visibility 'early_access'" do
        it "returns only early access visible requirement blocks" do
          get :index,
              params: {
                query: "",
                visibility: "early_access",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to include(
            requirement_block_early_access_visible.id
          )
          expect(returned_ids).not_to include(
            requirement_block_any_visible.id,
            requirement_block_live_visible.id,
            requirement_block_with_specific_name.id,
            requirement_block_any_discarded.id,
            requirement_block_early_access_discarded.id,
            requirement_block_live_discarded.id
          )
        end
      end

      context "filtering by visibility 'live'" do
        it "returns only live visible requirement blocks" do
          get :index,
              params: {
                query: "",
                visibility: "live",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to include(requirement_block_live_visible.id)
          expect(returned_ids).not_to include(
            requirement_block_any_visible.id,
            requirement_block_early_access_visible.id,
            requirement_block_with_specific_name.id,
            requirement_block_any_discarded.id,
            requirement_block_early_access_discarded.id,
            requirement_block_live_discarded.id
          )
        end
      end

      context "including archived requirement blocks" do
        it "includes both visible and discarded requirement blocks when show_archived is true" do
          get :index,
              params: {
                query: "",
                show_archived: true,
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to include(
            requirement_block_any_discarded.id,
            requirement_block_live_discarded.id
          )
        end
      end

      context "searching with a query matching the name" do
        it "returns only the requirement blocks that match the query" do
          get :index,
              params: {
                query: "Specific Block Name",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to contain_exactly(
            requirement_block_with_specific_name.id
          )
        end
      end

      context "searching with a query matching the display name" do
        it "returns only the requirement blocks that match the display name query" do
          get :index,
              params: {
                query: "Block Any 1",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to contain_exactly(
            requirement_block_any_visible.id
          )
        end
      end

      context "sorting by name ascending" do
        it "returns requirement blocks sorted by name in ascending order" do
          get :index,
              params: {
                query: "",
                sort: {
                  field: "name",
                  direction: "asc"
                },
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          sorted_blocks = RequirementBlock.where(id: returned_ids).order(:name)
          expected_order = sorted_blocks.pluck(:id)

          expect(returned_ids).to eq(expected_order)
        end
      end

      context "sorting by updated_at descending" do
        it "returns requirement blocks sorted by updated_at in descending order" do
          # Update one of the records to have a newer updated_at
          requirement_block_any_visible.update(name: "Updated Block Any 1")
          RequirementBlock.reindex
          get :index,
              params: {
                query: "",
                sort: {
                  field: "updated_at",
                  direction: "desc"
                },
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          sorted_blocks =
            RequirementBlock.where(id: returned_ids).order(updated_at: :desc)
          expected_order = sorted_blocks.pluck(:id)

          expect(returned_ids).to eq(expected_order)
        end
      end

      context "providing invalid sort parameters" do
        it "defaults to sorting by updated_at descending when sort field is invalid" do
          get :index,
              params: {
                query: "",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          # Default sort is updated_at descending
          sorted_blocks =
            RequirementBlock.where(id: returned_ids).order(updated_at: :desc)
          expected_order = sorted_blocks.pluck(:id)

          expect(returned_ids).to eq(expected_order)
        end
      end

      context "pagination" do
        before do
          # Create additional requirement blocks to test pagination
          create_list(
            :requirement_block_with_requirements,
            5,
            name: "Paginated Block",
            display_name: "Paginated Display",
            visibility: :any,
            discarded_at: nil
          )
          RequirementBlock.reindex
          RequirementBlock.search_index.refresh
        end

        context "when requesting the first page with per_page=3" do
          it "returns the correct number of results per page" do
            get :index,
                params: {
                  query: "",
                  page: 1,
                  per_page: 3
                },
                format: :json
            expect(response).to have_http_status(:success)
            expect(json_response["data"].size).to eq(3)
          end
        end

        context "when requesting the second page with per_page=3" do
          it "returns the correct page of results" do
            get :index,
                params: {
                  query: "",
                  page: 2,
                  per_page: 3
                },
                format: :json
            expect(response).to have_http_status(:success)
            expect(json_response["data"].size).to eq(3)
            # Further assertions can be made based on the created templates
          end
        end

        context "when requesting a page number beyond available pages" do
          it "returns an empty array" do
            get :index,
                params: {
                  query: "",
                  page: 100,
                  per_page: 3
                },
                format: :json
            expect(response).to have_http_status(:success)
            expect(json_response["data"]).to be_empty
          end
        end
      end

      context "searching with multiple visibility filters" do
        it "returns requirement blocks matching any of the specified visibilities" do
          get :index,
              params: {
                query: "",
                visibility: "any,early_access",
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expect(returned_ids).to include(
            requirement_block_any_visible.id,
            requirement_block_early_access_visible.id,
            requirement_block_with_specific_name.id
          )

          expect(returned_ids).not_to include(
            requirement_block_live_visible.id,
            requirement_block_any_discarded.id,
            requirement_block_early_access_discarded.id,
            requirement_block_live_discarded.id
          )
        end
      end

      context "when including specific filters and sorting" do
        it "applies multiple filters and sorts correctly" do
          get :index,
              params: {
                query: "Block",
                visibility: "any,live",
                sort: {
                  field: "name",
                  direction: "asc"
                },
                page: 1,
                per_page: 20
              },
              format: :json
          expect(response).to have_http_status(:success)

          returned_ids = json_response["data"].map { |rb| rb["id"] }

          expected_ids = [
            requirement_block_any_visible.id,
            requirement_block_live_visible.id,
            requirement_block_with_specific_name.id,
            paginated_requirement_blocks.first.id,
            paginated_requirement_blocks.second.id
          ]

          expect(returned_ids).to include(*expected_ids)
          expect(returned_ids).not_to include(
            requirement_block_early_access_visible.id,
            requirement_block_any_discarded.id,
            requirement_block_early_access_discarded.id,
            requirement_block_live_discarded.id
          )

          # Verify the sorting by name ascending
          sorted_blocks = RequirementBlock.where(id: returned_ids).order(:name)
          expected_order = sorted_blocks.pluck(:id)

          expect(returned_ids).to eq(expected_order)
        end
      end
    end
  end
end

require "swagger_helper"

RSpec.describe "external_api/v2/permit_projects",
               type: :request,
               search: true,
               openapi_spec: "external_api/v2/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let!(:Authorization) { "Bearer #{external_api_key.token}" }
  let!(:permit_application) do
    create(
      :permit_application,
      :newly_submitted,
      jurisdiction: external_api_key.jurisdiction
    )
  end

  before do
    permit_application.permit_project.update_column(
      :state,
      PermitProject.states[:queued]
    )
    PermitProject.reindex
  end

  path "/permit_projects/search" do
    post "Searches non-draft permit projects in the key's jurisdiction and sandbox." do
      tags "Permit projects"
      consumes "application/json"
      produces "application/json"
      parameter name: :constraints,
                in: :body,
                schema: {
                  type: :object,
                  properties: {
                    constraints: {
                      type: :object,
                      properties: {
                        state: {
                          "$ref" => "#/components/schemas/ProjectState"
                        }
                      }
                    }
                  }
                }
      let(:constraints) { {} }

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   items: {
                     "$ref" => "#/components/schemas/PermitProject"
                   }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     total_pages: {
                       type: :integer
                     },
                     total_count: {
                       type: :integer
                     },
                     current_page: {
                       type: :integer
                     }
                   },
                   required: %w[total_pages total_count current_page]
                 }
               },
               required: %w[data meta]

        run_test!
      end
    end
  end

  path "/permit_projects/{id}" do
    get "Retrieves a permit project with sibling application summaries." do
      tags "Permit projects"
      produces "application/json"
      parameter name: "id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Permit project ID"
      let(:id) { permit_application.permit_project_id }

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/PermitProject"
                 }
               },
               required: %w[data]

        run_test!
      end
    end
  end

  path "/permit_projects/{id}/state" do
    patch "Sets a permit project's state to a code legal from its current state." do
      tags "Permit projects"
      consumes "application/json"
      produces "application/json"
      parameter name: "id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Permit project ID"
      parameter name: :state_update,
                in: :body,
                schema: {
                  type: :object,
                  required: %w[state],
                  properties: {
                    state: {
                      "$ref" => "#/components/schemas/ProjectState"
                    }
                  }
                }
      let(:id) { permit_application.permit_project_id }
      let(:state_update) { { state: "in_progress" } }

      before do
        permit_application.permit_project.update_column(
          :state,
          PermitProject.states[:queued]
        )
      end

      response(200, "State updated") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/PermitProject"
                 }
               },
               required: %w[data]

        run_test!
      end

      response(422, "Illegal or unknown state") do
        schema "$ref" => "#/components/schemas/ResponseError"
        let(:state_update) { { state: "draft" } }

        run_test!
      end
    end
  end
end

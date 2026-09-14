require "swagger_helper"

RSpec.describe "external_api/v2/permit_projects",
               type: :request,
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
end

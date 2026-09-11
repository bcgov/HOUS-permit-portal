require "swagger_helper"

RSpec.describe "external_api/v2/permit_applications",
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
    Jurisdiction.reindex
    PermitApplication.reindex
  end

  path "/permit_applications/search" do
    post "Searches submitted permit applications in the key's jurisdiction and sandbox." do
      tags "Permit applications"
      consumes "application/json"
      produces "application/json"
      parameter name: :constraints,
                in: :body,
                schema: {
                  type: :object,
                  properties: {
                    status: {
                      "$ref" => "#/components/schemas/ApplicationStatus"
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
                     "$ref" => "#/components/schemas/PermitApplication"
                   }
                 }
               },
               required: %w[data]

        run_test!
      end
    end
  end

  path "/permit_applications/{id}" do
    get "Retrieves a submitted permit application." do
      tags "Permit applications"
      produces "application/json"
      parameter name: "id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Submitted permit application ID"
      let(:id) { permit_application.id }

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/PermitApplication"
                 }
               },
               required: %w[data]

        run_test!
      end
    end
  end

  path "/permit_applications/{id}/status" do
    patch(
      "Updates a submitted permit application's status using a canonical Building Permit Hub code."
    ) do
      tags "Permit applications"
      consumes "application/json"
      produces "application/json"
      parameter name: "id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Submitted permit application ID"
      parameter name: :status_update,
                in: :body,
                schema: {
                  type: :object,
                  required: %w[status],
                  properties: {
                    status: {
                      "$ref" =>
                        "#/components/schemas/PartnerWritableApplicationStatus"
                    }
                  }
                }
      let(:id) { permit_application.id }
      let(:status_update) { { status: "in_review" } }

      response(200, "Status updated") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/PermitApplication"
                 }
               },
               required: %w[data]

        run_test!
      end

      response(422, "Invalid status code or lifecycle transition") do
        schema "$ref" => "#/components/schemas/ResponseError"
        let(:status_update) { { status: "newly_submitted" } }

        run_test!
      end
    end
  end

  path "/permit_applications/versions/{version_id}/integration_mapping" do
    get "Retrieves the jurisdiction integration mapping for a template version." do
      tags "Permit applications"
      produces "application/json"
      parameter name: "version_id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Template version ID"
      let(:version_id) { permit_application.template_version_id }

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/IntegrationMapping"
                 }
               },
               required: %w[data]

        run_test!
      end
    end
  end
end

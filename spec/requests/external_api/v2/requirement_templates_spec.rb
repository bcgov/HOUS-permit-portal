require "swagger_helper"

RSpec.describe "external_api/v2/requirement_templates",
               type: :request,
               openapi_spec: "external_api/v2/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let!(:Authorization) { "Bearer #{external_api_key.token}" }

  path "/requirement_templates" do
    get "Lists requirement templates whose published version can be added as a draft." do
      tags "Requirement templates"
      produces "application/json"

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   items: {
                     "$ref" => "#/components/schemas/RequirementTemplate"
                   }
                 }
               },
               required: %w[data]

        run_test!
      end
    end
  end
end

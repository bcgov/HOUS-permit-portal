require "swagger_helper"

RSpec.describe "external_api/v2/revision_reasons",
               type: :request,
               openapi_spec: "external_api/v2/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let!(:Authorization) { "Bearer #{external_api_key.token}" }

  path "/revision_reasons" do
    get "Lists the current site-configured revision reason codes." do
      tags "Revision reasons"
      produces "application/json"

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   items: {
                     "$ref" => "#/components/schemas/RevisionReason"
                   }
                 }
               },
               required: %w[data]

        run_test!
      end
    end
  end
end

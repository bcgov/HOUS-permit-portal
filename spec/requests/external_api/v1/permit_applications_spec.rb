require "swagger_helper"

RSpec.describe "external_api/v1/permit_applications",
               type: :request,
               openapi_spec: "external_api_docs/v1/swagger.yaml" do
  let(:external_api_key) { create(:external_api_key) }
  let(:token) { external_api_key.token }
  let(:Authorization) { "Bearer #{token}" }
  let(:submitted_permit_applications) do
    [
      create(:permit_application, status: "submitted", jurisdiction: external_api_key.jurisdiction),
      create(:permit_application, status: "submitted", jurisdiction: external_api_key.jurisdiction),
      create(:permit_application, status: "submitted", jurisdiction: external_api_key.jurisdiction),
    ]
  end
  let(:draft_permit_applications) do
    [
      create(:permit_application, jurisdiction: external_api_key.jurisdiction),
      create(:permit_application, jurisdiction: external_api_key.jurisdiction),
      create(:permit_application, jurisdiction: external_api_key.jurisdiction),
    ]
  end
  let(:unauthorized_jurisdiction_permit_applications) do
    [
      create(:permit_application, status: "submitted"),
      create(:permit_application),
      create(:permit_application, status: "submitted"),
    ]
  end

  path "/external_api/v1/permit_applications/search" do
    post "lists submitted permit applications" do
      consumes "application/json"
      security [Bearer: {}]
      parameter name: :Authorization, in: :header, type: :string
      parameter name: :constraints,
                in: :body,
                schema: {
                  type: :object,
                  description: "Filters permit applications by submitted date and permit classifications",
                  properties: {
                    permit_classifications: {
                      description: "Filters by permit classifications",
                      type: :string,
                    },
                    submitted_at: {
                      type: :object,
                      description: "Filters by submitted date",
                      properties: {
                        gt: {
                          type: :date,
                          description: "Greater than: submitted date is greater than this date",
                        },
                        lt: {
                          type: :date,
                          description: "Less than: submitted date is less than this date",
                        },
                        gte: {
                          type: :date,
                          description: "Greater than or equal to: submitted date is greater than or equal to this date",
                        },
                        lte: {
                          type: :date,
                          description: "Less than or equal to: submitted date is less than or equal to this date",
                        },
                      },
                    },
                  },
                }

      response(200, "successful") do
        run_test!
        # run_test! do |res|
        #   binding.pry
        #   data = JSON.parse(res.body)
        #
        #   expect(data.dig("data").length).to eq(submitted_permit_applications.length)
        # end
      end
    end
  end

  # path "/external_api/v1/permit_applications/{id}" do
  #   # You'll want to customize the parameter types...
  #   parameter name: "id", in: :path, type: :string, description: "id"
  #
  #   get("show permit_application") do
  #     response(200, "successful") do
  #       let(:id) { "123" }
  #
  #       run_test!
  #     end
  #   end
  # end
end

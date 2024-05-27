require "swagger_helper"

RSpec.describe "external_api/v1/permit_applications", type: :request, openapi_spec: "external_api/v1/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key) }
  let!(:token) { external_api_key.token }
  let!(:Authorization) { "Bearer #{token}" }
  let!(:submitted_permit_applications) do
    create_list(:permit_application, 3, status: "submitted", jurisdiction: external_api_key.jurisdiction)
  end
  let!(:draft_permit_applications) { create_list(:permit_application, 3, jurisdiction: external_api_key.jurisdiction) }
  let!(:unauthorized_jurisdiction_permit_applications) do
    [
      create(:permit_application, status: "submitted"),
      create(:permit_application),
      create(:permit_application, status: "submitted"),
    ]
  end

  path "/permit_applications/search" do
    before do
      Jurisdiction.search_index.refresh
      PermitApplication.search_index.refresh
    end

    post "lists paginated permit applications" do
      let(:constraints) { nil }
      tags "permit applications"
      consumes "application/json"
      produces "application/json"
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
                          type: :string,
                          format: "date-time",
                          description: "Greater than: submitted date is greater than this date",
                        },
                        lt: {
                          type: :string,
                          format: "date-time",
                          description: "Less than: submitted date is less than this date",
                        },
                        gte: {
                          type: :string,
                          format: "date-time",
                          description: "Greater than or equal to: submitted date is greater than or equal to this date",
                        },
                        lte: {
                          type: :string,
                          format: "date-time",
                          description: "Less than or equal to: submitted date is less than or equal to this date",
                        },
                      },
                    },
                  },
                }

      response(200, "successful") do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   description: "Submitted permit applications for the jurisdiction",
                   items: {
                     "$ref" => "#/components/schemas/PermitApplication",
                   },
                 },
                 meta: {
                   type: :object,
                   properties: {
                     total_pages: {
                       type: :integer,
                       description: "Total number of pages",
                     },
                     total_count: {
                       type: :integer,
                       description: "Total number of permit applications",
                     },
                     current_page: {
                       type: :integer,
                       description: "Current page number",
                     },
                   },
                   required: %w[total_pages total_count current_page],
                 },
               },
               required: %w[data meta]

        run_test! do |res|
          data = JSON.parse(res.body)

          expect(data.dig("data").length).to eq(submitted_permit_applications.length)
        end
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

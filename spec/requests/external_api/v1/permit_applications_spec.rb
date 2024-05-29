require "swagger_helper"

# rwag gem does not support Open API 3.1.0 yet. So the webhook documentation
# is manually entered in the yaml as the prior to this version Open Api
# had to have path keys. So when running `RAILS_ENV=test rails rswag` to generate the swagger.yaml
# this will remove those changes, so make sure to copy over the webhook changes
# and set openapi version to 3.1.0

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

  before do
    Jurisdiction.search_index.refresh
    PermitApplication.search_index.refresh
  end

  path "/permit_applications/search" do
    post "This endpoint retrieves a list of permit applications in a paginated format. It allows you to search through permit applications based on specified criteria, returning results in manageable pages." do
      tags "Permit applications"
      let(:constraints) { nil }
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

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   description: "Submitted permit applications",
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

      response(429, "Rate limit exceeded") do
        schema "$ref" => "#/components/schemas/ResponseError"
        around { |example| with_temporary_rate_limit("external_api/ip", limit: 3, period: 1.minute) { example.run } }
        before { 5.times { get search_v1_permit_applications_path, headers: { Authorization: "Bearer #{token}" } } }

        run_test! { |response| expect(response.status).to eq(429) }
      end
    end
  end

  path "/permit_applications/{id}" do
    parameter name: "id", in: :path, type: :string, description: "Submitted permit application id"

    let(:id) { submitted_permit_applications.first.id }

    get(
      "This endpoint retrieves detailed information about a specific permit application using its unique identifier (ID). Please note that requests to this endpoint are subject to rate limiting to ensure optimal performance and fair usage.",
    ) do
      tags "Permit applications"
      consumes "application/json"
      produces "application/json"
      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/PermitApplication",
                 },
               },
               required: %w[data]

        run_test! do |res|
          data = JSON.parse(res.body)

          expect(data.dig("data", "id")).to eq(submitted_permit_applications.first.id)
        end
      end
    end

    get "accessing permit application from a different jurisdiction" do
      let(:id) { unauthorized_jurisdiction_permit_applications.first.id }
      consumes "application/json"
      produces "application/json"

      response(403, "Accessing a permit application for unauthorized jurisdiction") do
        run_test! { |response| expect(response.status).to eq(403) }
      end
    end

    get "accessing permit application that does not exist" do
      let(:id) { "does_not_exist" }
      consumes "application/json"
      produces "application/json"

      response(404, "Accessing a permit application which does not exist") do
        run_test! { |response| expect(response.status).to eq(404) }
      end
    end

    get "requests are rate limited" do
      consumes "application/json"
      produces "application/json"

      response(429, "Rate limit exceeded") do
        schema "$ref" => "#/components/schemas/ResponseError"
        around { |example| with_temporary_rate_limit("external_api/ip", limit: 3, period: 1.minute) { example.run } }
        before { 5.times { get v1_permit_application_path(id), headers: { Authorization: "Bearer #{token}" } } }

        run_test! { |response| expect(response.status).to eq(429) }
      end
    end
  end
end

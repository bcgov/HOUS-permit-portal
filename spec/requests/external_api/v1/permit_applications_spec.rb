require "swagger_helper"

RSpec.describe "external_api/v1/permit_applications",
               type: :request,
               openapi_spec: "external_api/v1/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key) }
  let!(:token) { external_api_key.token }
  let!(:Authorization) { "Bearer #{token}" }
  let!(:submitted_permit_applications) do
    create_list(
      :permit_application,
      3,
      :newly_submitted,
      jurisdiction: external_api_key.jurisdiction
    )
  end
  let!(:draft_permit_applications) do
    create_list(
      :permit_application,
      3,
      jurisdiction: external_api_key.jurisdiction
    )
  end
  let!(:unauthorized_jurisdiction_permit_applications) do
    [
      create(:permit_application, :newly_submitted),
      create(:permit_application),
      create(:permit_application, :newly_submitted)
    ]
  end

  before do
    Jurisdiction.reindex
    PermitApplication.reindex
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
                  description:
                    "Filters permit applications by status, submitted date, resubmitted_date and permit classifications",
                  properties: {
                    permit_classifications: {
                      description: "Filters by permit classifications",
                      type: :string
                    },
                    status: {
                      type: :string,
                      enum: %w[newly_submitted resubmitted],
                      description:
                        "Filters by submitted status. Newly submitted: permit applications submitted for the first time. Resubmitted: permit applications resubmitted after a revision request."
                    },
                    submitted_at: {
                      type: :object,
                      description:
                        "Filters by submitted date. This is the date the permit application was first submitted. Example format `2024-04-30T13:22:41-07:00`",
                      properties: {
                        gt: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Greater than: submitted date is greater than this date"
                        },
                        lt: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Less than: submitted date is less than this date"
                        },
                        gte: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Greater than or equal to: submitted date is greater than or equal to this date"
                        },
                        lte: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Less than or equal to: submitted date is less than or equal to this date"
                        }
                      }
                    },
                    resubmitted_at: {
                      type: :object,
                      description:
                        "Filters by resubmitted date. This is the date the permit application was most recently resubmitted. Example format `2024-04-30T13:22:41-07:00`",
                      properties: {
                        gt: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Greater than: resubmitted date is greater than this date"
                        },
                        lt: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Less than: resubmitted date is less than this date"
                        },
                        gte: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Greater than or equal to: resubmitted date is greater than or equal to this date"
                        },
                        lte: {
                          type: :string,
                          format: "date-time",
                          description:
                            "Less than or equal to: resubmitted date is less than or equal to this date"
                        }
                      }
                    }
                  }
                }

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   description: "Submitted permit applications",
                   items: {
                     "$ref" => "#/components/schemas/PermitApplication"
                   }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     total_pages: {
                       type: :integer,
                       description: "Total number of pages"
                     },
                     total_count: {
                       type: :integer,
                       description: "Total number of permit applications"
                     },
                     current_page: {
                       type: :integer,
                       description: "Current page number"
                     }
                   },
                   required: %w[total_pages total_count current_page]
                 }
               },
               required: %w[data meta]

        run_test! do |res|
          data = JSON.parse(res.body)

          expect(data.dig("data").length).to eq(
            submitted_permit_applications.length
          )
        end
      end

      response(
        429,
        "Rate limit exceeded. Note: The rate limit is 100 requests per minute per API key and 300 requests per IP in a 3 minute interval"
      ) do
        schema "$ref" => "#/components/schemas/ResponseError"
        around do |example|
          with_temporary_rate_limit(
            "external_api/ip",
            limit: 3,
            period: 1.minute
          ) { example.run }
        end
        before do
          5.times do
            get search_v1_permit_applications_path,
                headers: {
                  Authorization: "Bearer #{token}"
                }
          end
        end

        run_test! { |response| expect(response.status).to eq(429) }
      end
    end
  end

  path "/permit_applications/{id}" do
    get(
      "This endpoint retrieves detailed information about a specific permit application using its unique identifier (ID). Please note that requests to this endpoint are subject to rate limiting to ensure optimal performance and fair usage."
    ) do
      parameter name: "id",
                in: :path,
                type: :string,
                description: "Submitted permit application id"
      tags "Permit applications"
      consumes "application/json"
      produces "application/json"

      let(:id) { submitted_permit_applications.first.id }

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/PermitApplication"
                 }
               },
               required: %w[data]

        run_test! do |res|
          data = JSON.parse(res.body)

          expect(data.dig("data", "id")).to eq(
            submitted_permit_applications.first.id
          )
        end
      end

      response(
        403,
        "Accessing a permit application for unauthorized jurisdiction"
      ) do
        let(:id) { unauthorized_jurisdiction_permit_applications.first.id }
        run_test! { |response| expect(response.status).to eq(403) }
      end

      response(404, "Accessing a permit application which does not exist") do
        let(:id) { "does_not_exist" }
        run_test! { |response| expect(response.status).to eq(404) }
      end

      response(429, "Rate limit exceeded") do
        schema "$ref" => "#/components/schemas/ResponseError"
        around do |example|
          with_temporary_rate_limit(
            "external_api/ip",
            limit: 3,
            period: 1.minute
          ) { example.run }
        end
        before do
          5.times do
            get v1_permit_application_path(id),
                headers: {
                  Authorization: "Bearer #{token}"
                }
          end
        end

        run_test! { |response| expect(response.status).to eq(429) }
      end
    end
  end

  path "/permit_applications/versions/{version_id}/integration_mapping" do
    get(
      "This endpoint retrieves the integration mapping between the Building Permit Hub system and the local jurisdiction’s integration system. It uses a unique ID associated with a specific version of the permit template."
    ) do
      parameter name: "version_id",
                in: :path,
                type: :string,
                description:
                  "This identifier corresponds to a specific version of the permit template, distinct from the permit application ID, which uniquely identifies an individual permit application."

      tags "Permit applications"
      consumes "application/json"
      produces "application/json"

      let(:version_id) do
        submitted_permit_applications.first.template_version.id
      end
      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/IntegrationMapping"
                 }
               },
               required: %w[data]

        run_test! do |res|
          data = JSON.parse(res.body)

          expect(data.dig("data", "id")).to eq(
            IntegrationMapping.find_by(
              jurisdiction: external_api_key.jurisdiction,
              template_version_id: version_id
            ).id
          )
        end
      end

      response(404, "Accessing a integration mapping which does not exist") do
        let(:version_id) { "does_not_exist" }
        run_test! { |response| expect(response.status).to eq(404) }
      end

      response(
        429,
        "Rate limit exceeded. Note: The rate limit is 100 requests per minute per API key and 300 requests per IP in a 3 minute interval"
      ) do
        schema "$ref" => "#/components/schemas/ResponseError"
        around do |example|
          with_temporary_rate_limit(
            "external_api/ip",
            limit: 3,
            period: 1.minute
          ) { example.run }
        end
        before do
          5.times do
            get "/external_api/v1/permit_applications/versions/#{version_id}/integration_mapping",
                headers: {
                  Authorization: "Bearer #{token}"
                }
          end
        end

        run_test! { |response| expect(response.status).to eq(429) }
      end
    end
  end
end

require "swagger_helper"

RSpec.describe "external_api/v2/project_meetings",
               type: :request,
               openapi_spec: "external_api/v2/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let!(:Authorization) { "Bearer #{external_api_key.token}" }
  let!(:project_meeting) do
    create(
      :project_meeting,
      :open,
      permit_project:
        create(:permit_project, jurisdiction: external_api_key.jurisdiction)
    )
  end
  let(:id) { project_meeting.id }

  path "/project_meetings/{id}" do
    get "Retrieves a submitted project meeting request." do
      tags "Project meetings"
      produces "application/json"
      parameter name: "id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Project meeting ID"

      response(200, "Successful") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/ProjectMeeting"
                 }
               },
               required: %w[data]

        run_test!
      end
    end

    patch "Accepts an open project meeting request by scheduling it." do
      tags "Project meetings"
      consumes "application/json"
      produces "application/json"
      parameter name: "id",
                in: :path,
                type: :string,
                format: :uuid,
                description: "Project meeting ID"
      parameter name: :schedule,
                in: :body,
                schema: {
                  type: :object,
                  required: %w[confirmed_date contact_method],
                  properties: {
                    confirmed_date: {
                      type: :string,
                      format: :"date-time"
                    },
                    contact_method: {
                      type: :string,
                      enum: %w[phone in_person videoconference],
                      description:
                        "meeting_url is required when contact_method is videoconference, and must be an http(s) URL when present."
                    },
                    meeting_url: {
                      type: :string,
                      nullable: true
                    }
                  }
                }
      let(:schedule) do
        { confirmed_date: 1.week.from_now.iso8601, contact_method: "phone" }
      end

      response(200, "Meeting scheduled") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/ProjectMeeting"
                 }
               },
               required: %w[data]

        run_test!
      end

      response(
        422,
        "Meeting is not open, or schedule details are missing or invalid"
      ) do
        schema "$ref" => "#/components/schemas/ResponseError"
        let(:schedule) do
          {
            confirmed_date: 1.week.from_now.iso8601,
            contact_method: "videoconference"
          }
        end

        run_test!
      end
    end
  end
end

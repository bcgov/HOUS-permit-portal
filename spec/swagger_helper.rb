# frozen_string_literal: true

require "rails_helper"

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.openapi_root = Rails.root.join("swagger").to_s

  servers = [
    { url: "https:/buildingpermit.gov.bc.ca", description: "Production server" },
    {
      url: "{serverUrl}",
      description: "Server url",
      variables: {
        serverUrl: {
          default: "https:/buildingpermit.gov.bc.ca",
        },
      },
    },
  ]

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:swaggerize' rake task, the complete Swagger will
  # be generated at the provided relative path under openapi_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a openapi_spec tag to the
  # the root example_group in your specs, e.g. describe '...', openapi_spec: 'v2/swagger.json'
  config.openapi_specs = {
    "external_api/v1/swagger.yaml" => {
      openapi: "3.1.0",
      info: {
        title: "Integration API V1",
        version: "v1",
        description: <<-DESC,
### API documentation overview
This document provides detailed information about the APIs available for external integrators to query and retrieve submitted permit applications.
It also includes specifications on webhook events that notify your systems in real-time.

### Data scope:
The permit applications returned by these APIs are limited to those within the jurisdiction associated with the API key used for the request. This
ensures that each integrator has access solely to relevant data.

### Integration steps:
To integrate with our APIs, please contact the Building Permit Hub team to enable your API access. Your local jurisdiction can then obtain the API key
and register your webhook URL in their configuration settings on the building permit hub. You can reach us directly at <digital.codes.permits@gov.bc.ca>
for further assistance.

### Authentication and authorization: 
Access to these APIs is controlled via an API key, which must be included in the Authorization header as a Bearer token like so:
```
Authorization: Bearer {Your_API_Key_Here}
```
Please note that a unique API key is required for each jurisdiction you wish to access, enhancing security and data integrity.

### Rate limits:
To ensure fair usage, the API is rate-limited to 100 requests per minute per API key and 300 requests per IP in a 3 minute interval. Exceeding these
limits will result in a 429 response. If this occurs, we recommend spacing out your requests. Continued exceeding of rate limits
may necessitate further contact with the building permit hub team.

### Api base path:
The base path for all API endpoints is `/external_api/v1`.

### Server information for testing:
For testing purposes, please use the server located at {serverUrl}. The computed URL for API interactions is https://buildingpermit.gov.bc.ca.
During your integration testing phase, you have the flexibility to use custom URLs by configuring the serverUrl variable. This allows you to
tailor the API environment to better suit your development needs. Ensure that your custom URLs are configured correctly to avoid any connectivity or data access issues.

### Visual aids and examples:
For a better understanding of how our APIs work, including webhook setups and request handling, please refer to the code examples included later
in this document.
        DESC
      },
      paths: {
      },
      basePath: "/external_api/v1",
      servers: servers,
      tags: [
        { name: "Permit applications", description: "Submitted permit applications (scoped to API key jurisdiction)" },
      ],
      components: {
        securitySchemes: {
          Bearer: {
            type: :http,
            scheme: :bearer,
            description: "Bearer token",
          },
        },
        schemas: {
          PermitApplication: {
            type: :object,
            properties: {
              id: {
                type: :string,
              },
              full_address: {
                type: :string,
                description: "The full address of the permit application.",
                nullable: true,
              },
              number: {
                type: :string,
                description: "The permit application number displayed to the user.",
                nullable: true,
              },
              pid: {
                type: :string,
                description: "The PID of the permit application.",
                nullable: true,
              },
              pin: {
                type: :string,
                description: "The PIN of the permit application.",
                nullable: true,
              },
              reference_number: {
                type: :string,
                description: "The reference number of the permit application in external system.",
                nullable: true,
              },
              submitted_at: {
                type: :number,
                format: :int64, # Indicates that it's an integer representing time in milliseconds since epoch
                description: "Datetime in milliseconds since the epoch (Unix time)",
              },
              permit_classifications: {
                type: :string,
              },
              permit_type: {
                "$ref" => "#/components/schemas/PermitClassification",
              },
              activity: {
                "$ref" => "#/components/schemas/PermitClassification",
              },
              submission_data: {
                "$ref" => "#/components/schemas/SubmissionData",
              },
            },
          },
          SubmissionData: {
            type: :object,
            description: "The submitted permit application data. Note: the keys are the requirement block codes.",
            additionalProperties: {
              type: :object,
              properties: {
                id: {
                  type: :string,
                },
                requirement_block_code: {
                  type: :string,
                },
                name: {
                  type: :string,
                },
                description: {
                  type: :string,
                  nullable: true,
                },
                requirements: {
                  type: :array,
                  descriptions: "The requirements for this requirement block and their submitted values.",
                  items: {
                    type: :object,
                    properties: {
                      id: {
                        type: :string,
                      },
                      name: {
                        type: :string,
                      },
                      requirement_code: {
                        type: :string,
                        description: "The requirement code for this requirement.",
                      },
                      type: {
                        type: :string,
                        enum: Requirement.input_types.keys.map(&:to_s),
                        description: "The input type for this requirement.",
                      },
                      value: {
                        description: "The submitted value for this requirement.",
                        oneOf: [
                          { type: :string },
                          { type: :number },
                          { type: :boolean },
                          { "$ref" => "#/components/schemas/ContactSubmissionValue" },
                          { "$ref" => "#/components/schemas/MultiOptionSubmissionValue" },
                        ],
                      },
                    },
                    required: %w[id name requirement_code type value],
                  },
                },
              },
              required: %w[id requirement_block_code name requirements],
            },
          },
          PermitClassification: {
            type: :object,
            properties: {
              id: {
                type: :string,
              },
              name: {
                type: :string,
              },
              description: {
                type: :string,
                nullable: true,
              },
              code: {
                type: :string,
                description: "The code of the permit classification.",
              },
            },
          },
          MultiOptionSubmissionValue: {
            type: :object,
            additionalProperties: {
              type: :boolean,
            },
          },
          ContactSubmissionValue: {
            type: :array,
            items: {
              type: :object,
              properties: {
                first_name: {
                  type: :string,
                  description: "The first name of the contact.",
                },
                last_name: {
                  type: :string,
                  description: "The last name of the contact.",
                },
                email: {
                  type: :string,
                  description: "The email of the contact.",
                },
                phone: {
                  type: :string,
                  description: "The phone number of the contact.",
                },
                address: {
                  type: :string,
                  description: "The address of the contact.",
                },
                title: {
                  type: :string,
                  description: "The title of the contact.",
                },
                organization: {
                  type: :string,
                  description: "The organization of the contact.",
                },
              },
            },
          },
          ResponseError: {
            type: :object,
            properties: {
              data: {
                type: :object,
                properties: {
                },
              },
              meta: {
                type: :object,
                properties: {
                  message: {
                    type: :string,
                    description: "The error message.",
                  },
                  type: {
                    type: :string,
                    enum: %w[error],
                  },
                },
              },
            },
          },
        },
      },
      formats: %w[json yaml],
      security: [{ Bearer: [] }],
    },
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.openapi_format = :yaml
end

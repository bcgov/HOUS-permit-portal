class ProjectActivityBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    field :description
    field :timestamp
    field :user_name
    field :jurisdiction_name
    field :permit_name
    field :permit_application_id
    field :permit_application_number
  end
end

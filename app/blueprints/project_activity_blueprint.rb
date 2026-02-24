class ProjectActivityBlueprint < Blueprinter::Base
  # Serializes formatted activity entries from ProjectActivityPresenter.
  # Each entry is a plain hash (OpenStruct or similar), not an ActiveRecord model.
  #
  # [AUDITED VIBES TODO]: Once ProjectActivityPresenter.format returns real data,
  # ensure the field names here match. If using OpenStruct wrappers, Blueprinter
  # will call methods on the object — make sure the keys align.
  #
  # See: app/blueprints/permit_project_blueprint.rb for the existing pattern.

  identifier :id

  view :base do
    field :description
    field :timestamp
    field :user_name
    field :permit_name
    field :permit_application_id
    field :permit_application_number
    # [AUDITED VIBES TODO]: Add requirement_block_id for bonus deep-linking to
    # a specific requirement block within a permit application
  end
end

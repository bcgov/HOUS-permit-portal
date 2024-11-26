# frozen_string_literal: true

class CollaboratorBlueprint < Blueprinter::Base
  identifier :id
  association :collaboratorable,
              blueprint: ->(c) { c.blueprint },
              default: {
              },
              view: :minimal
  association :user, blueprint: UserBlueprint, view: :minimal
  fields :collaboratorable_type, :collaboratorable_id
end

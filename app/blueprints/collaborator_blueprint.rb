# frozen_string_literal: true

class CollaboratorBlueprint < Blueprinter::Base
  identifier :id
  fields :jurisdiction_id
  association :user, blueprint: UserBlueprint, view: :minimal
end

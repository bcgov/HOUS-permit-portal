class CollaboratorOptionBlueprint < Blueprinter::Base
  fields :label, :value

  view :base do
    field :label do |collaborator, _options|
      collaborator.user.name
    end

    field :value do |collaborator, _options|
      collaborator.id
    end
  end
end

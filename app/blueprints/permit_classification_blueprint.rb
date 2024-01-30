class PermitClassificationBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :code, :description, :enabled, :type, :description, :image_url
end

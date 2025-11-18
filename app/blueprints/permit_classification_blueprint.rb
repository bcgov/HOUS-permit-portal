class PermitClassificationBlueprint < Blueprinter::Base
  identifier :id
  fields :name,
         :code,
         :description_html,
         :enabled,
         :type,
         :image_url,
         :category,
         :category_label
end

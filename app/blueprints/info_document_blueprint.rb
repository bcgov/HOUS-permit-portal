class InfoDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :description,
         :sort_order,
         :published_at,
         :created_at,
         :updated_at

  field :topic_list, name: :topics

  association :document_file, blueprint: InfoDocumentFileBlueprint
end

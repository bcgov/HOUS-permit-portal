class TemplateVersionBlueprint < Blueprinter::Base
  identifier :id
  fields :status, :version_date, :created_at, :updated_at
end

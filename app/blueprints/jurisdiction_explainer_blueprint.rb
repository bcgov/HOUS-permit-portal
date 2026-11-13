class JurisdictionExplainerBlueprint < Blueprinter::Base
  identifier :id

  fields :jurisdiction_id, :local_context_html, :updated_at

  field(:name) { |record| record.jurisdiction.name }
  field(:qualified_name) { |record| record.jurisdiction.qualified_name }
end

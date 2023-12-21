class JurisdictionBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :description, :checklist_slate_data, :look_out_slate_data, :created_at, :updated_at

  association :contacts, blueprint: ContactBlueprint
end

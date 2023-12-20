class JurisdictionBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :description, :checklist_slate_data, :look_out_slate_data

  field :created_at do |jurisdiction, _options|
    jurisdiction.created_at.to_i
  end

  field :updated_at do |jurisdiction, _options|
    jurisdiction.updated_at.to_i
  end

  association :contacts, blueprint: ContactBlueprint
end

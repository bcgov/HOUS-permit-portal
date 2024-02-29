class ContactBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :title, :department, :email, :phone_number, :extension, :created_at
end

class ContactBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :title, :department, :email, :phone_number, :extension
end

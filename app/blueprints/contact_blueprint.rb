class ContactBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :title, :first_nation, :email, :phone_number, :extension
end

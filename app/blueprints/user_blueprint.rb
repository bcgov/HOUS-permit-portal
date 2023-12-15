class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email, :username, :first_name, :last_name, :certified
end

class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email, :username, :certified
end

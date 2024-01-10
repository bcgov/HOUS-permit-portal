class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email, :username, :role, :first_name, :last_name, :certified, :organization, :created_at
end

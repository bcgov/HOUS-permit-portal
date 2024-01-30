class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email,
         :username,
         :role,
         :first_name,
         :last_name,
         :certified,
         :organization,
         :created_at,
         :discarded_at,
         :last_sign_in_at

  view :extended do
    include_view :default # Includes all the fields defined in the base view
    association :jurisdiction, blueprint: JurisdictionBlueprint
  end
end

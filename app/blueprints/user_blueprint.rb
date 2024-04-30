class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email,
         :unconfirmed_email,
         :nickname,
         :role,
         :bceid_username,
         :bceid_email,
         :first_name,
         :last_name,
         :certified,
         :organization,
         :created_at,
         :confirmed_at,
         :confirmation_sent_at,
         :discarded_at,
         :last_sign_in_at

  view :current_user do
    field :eula_accepted do |user, _options|
      user.eula_variant.present? && user.license_agreements.active_agreement(user.eula_variant).present?
    end
  end

  view :extended do
    include_view :default # Includes all the fields defined in the base view
    include_view :current_user
    association :jurisdiction, blueprint: JurisdictionBlueprint
  end
end

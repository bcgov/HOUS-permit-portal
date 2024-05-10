class UserBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :email,
           :unconfirmed_email,
           :nickname,
           :role,
           :omniauth_username,
           :omniauth_email,
           :first_name,
           :last_name,
           :certified,
           :organization,
           :created_at,
           :confirmed_at,
           :confirmation_sent_at,
           :discarded_at,
           :last_sign_in_at
  end

  view :current_user do
    include_view :base
    field :eula_accepted do |user, _options|
      user.eula_variant.present? && user.license_agreements.active_agreement(user.eula_variant).present?
    end
  end

  view :extended do
    include_view :base
    include_view :current_user
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
  end

  view :invited_user do
    fields :email, :role

    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :minimal

    field :invited_by_email do |user, _options|
      user.invited_by&.email
    end
  end
end

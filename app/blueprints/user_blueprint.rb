class UserBlueprint < Blueprinter::Base
  identifier :id

  view :minimal do
    fields :email,
           :role,
           :first_name,
           :last_name,
           :organization,
           :certified,
           :confirmed_at,
           :discarded_at
  end

  view :accepted_license_agreements do
    association :license_agreements, blueprint: UserLicenseAgreementBlueprint
  end

  view :base do
    include_view :minimal
    fields :unconfirmed_email,
           :omniauth_username,
           :omniauth_email,
           :omniauth_provider,
           :created_at,
           :confirmation_sent_at,
           :discarded_at,
           :last_sign_in_at
    association :preference, blueprint: PreferenceBlueprint
  end

  view :external_api do
    fields :email, :first_name, :last_name
  end

  view :current_user do
    include_view :base
    field :eula_accepted do |user, _options|
      user.eula_variant.present? &&
        user.license_agreements.active_agreement(user.eula_variant).present?
    end
  end

  view :extended do
    include_view :base
    include_view :current_user
    association :jurisdictions, blueprint: JurisdictionBlueprint, view: :base
  end

  view :invited_user do
    fields :email, :role

    association :jurisdictions, blueprint: JurisdictionBlueprint, view: :minimal

    field :invited_by_email do |user, _options|
      user.invited_by&.email
    end

    association :invited_to_jurisdiction,
                blueprint: JurisdictionBlueprint,
                view: :minimal do |user, _options|
      user
        .jurisdiction_memberships
        &.order(updated_at: :desc)
        &.first
        &.jurisdiction
    end
  end
end

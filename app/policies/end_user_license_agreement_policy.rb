class EndUserLicenseAgreementPolicy < ApplicationPolicy
  def index?
    user.present?
  end
end

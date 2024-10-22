class Api::EndUserLicenseAgreementController < Api::ApplicationController
  skip_after_action :verify_policy_scoped
  skip_before_action :require_confirmation

  def index
    authorize :end_user_license_agreement, :index?
    render_success EndUserLicenseAgreement.active_agreement(
                     current_user.eula_variant
                   )
  end
end

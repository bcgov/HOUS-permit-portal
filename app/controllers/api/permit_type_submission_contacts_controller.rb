class Api::PermitTypeSubmissionContactsController < Api::ApplicationController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  # GET /permit_type_submission_contacts/confirm?confirmation_token=abcdef
  # use a special redirect with a frontend flash message here
  def confirm
    @contact = PermitTypeSubmissionContact.confirm_by_token!(params[:confirmation_token])
    redirect_to confirmed_url
  end
end

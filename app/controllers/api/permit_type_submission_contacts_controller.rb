class Api::PermitTypeSubmissionContactsController < ActionController::API
  # GET /permit_type_submission_contacts/confirm?confirmation_token=abcdef
  # use a special redirect with a frontend flash message here
  def confirm
    @contact =
      PermitTypeSubmissionContact.confirm_by_token!(params[:confirmation_token])
    redirect_to confirmed_url
  end
end

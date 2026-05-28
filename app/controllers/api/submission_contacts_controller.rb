class Api::SubmissionContactsController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: %i[confirm]
  skip_before_action :require_confirmation, only: %i[confirm]
  skip_after_action :verify_authorized, only: %i[confirm]

  before_action :set_submission_contact, only: %i[update destroy]

  def index
    contacts =
      if params[:jurisdiction_id].present?
        policy_scope(SubmissionContact).where(
          jurisdiction_id: params[:jurisdiction_id]
        )
      else
        policy_scope(SubmissionContact)
      end

    render_success contacts, nil, { blueprint: SubmissionContactBlueprint }
  end

  def confirm
    contact =
      SubmissionContact.find_by!(
        confirmation_token: params[:confirmation_token]
      )
    contact.confirm!
    redirect_to confirmed_url
  end

  def create
    jurisdiction =
      Jurisdiction.find(submission_contact_params[:jurisdiction_id])
    contact = jurisdiction.submission_contacts.new(submission_contact_params)
    authorize contact, :create?

    if contact.save
      render_success contact, nil, { blueprint: SubmissionContactBlueprint }
    else
      render_error "submission_contact.create_error",
                   { errors: contact.errors.full_messages }
    end
  rescue StandardError => e
    render_error "submission_contact.create_error", {}, e
  end

  def update
    authorize :submission_contact, :update?

    if @submission_contact.update(submission_contact_params)
      render_success @submission_contact,
                     nil,
                     { blueprint: SubmissionContactBlueprint }
    else
      render_error "submission_contact.update_error",
                   { errors: @submission_contact.errors.full_messages }
    end
  rescue StandardError => e
    render_error "submission_contact.update_error", {}, e
  end

  def destroy
    authorize :submission_contact, :destroy?
    @submission_contact.destroy!
    render_success @submission_contact,
                   nil,
                   { blueprint: SubmissionContactBlueprint }
  rescue ActiveRecord::InvalidForeignKey => e
    render_error("submission_contact.in_use_error", { status: 400 }, e)
  rescue StandardError => e
    render_error "submission_contact.destroy_error", {}, e
  end

  private

  def submission_contact_params
    params.require(:submission_contact).permit(
      :jurisdiction_id,
      :email,
      :title,
      :default,
      :type
    )
  end

  def set_submission_contact
    @submission_contact = policy_scope(SubmissionContact).find(params[:id])
  end
end

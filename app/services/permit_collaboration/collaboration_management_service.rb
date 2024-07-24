class PermitCollaboration::CollaborationManagementService
  attr_accessor :permit_application

  def initialize(permit_application)
    @permit_application = permit_application
  end

  def assign_collaborator!(
    authorize_collaboration: nil,
    collaborator_id:,
    collaborator_type:,
    assigned_requirement_block_id: nil
  )
    permit_collaboration =
      build_permit_collaboration(
        collaborator_id: collaborator_id,
        collaborator_type: collaborator_type,
        assigned_requirement_block_id: assigned_requirement_block_id,
      )

    authorize_collaboration.call(permit_collaboration) unless authorize_collaboration.nil?

    return permit_collaboration if permit_collaboration.save

    raise PermitCollaborationError,
          I18n.t(
            "services.permit_collaboration.collaboration_management.assign_collaborator_error",
            error_message: permit_collaboration.errors.full_messages.join(", "),
          )
  end

  def invite_new_submission_collaborator!(
    authorize_collaboration: nil,
    inviter:,
    user_params:,
    collaborator_type:,
    assigned_requirement_block_id: nil
  )
    ActiveRecord::Base.transaction do
      begin
        user = User.find_by(email: user_params[:email].strip)
        is_new_user = user.blank?

        user ||= create_submission_user!(user_params)

        collaborator = create_collaborator!(inviter, user)

        permit_collaboration =
          assign_collaborator!(
            authorize_collaboration: authorize_collaboration,
            collaborator_id: collaborator.id,
            collaborator_type: collaborator_type,
            assigned_requirement_block_id: assigned_requirement_block_id,
          )

        send_submission_collaboration_email!(permit_collaboration, inviter, is_new_user)

        permit_collaboration
      end
    end
  end

  private

  def send_submission_collaboration_email!(permit_collaboration, inviter, is_new_user = false)
    user = permit_collaboration.collaborator.user

    if !user.submitter?
      raise PermitCollaborationError,
            I18n.t("services.permit_collaboration.collaboration_management.submission_collaborator_must_be_submitter")
    end

    should_send_registration_collaboration_email = is_new_user || user.discarded? || !user.confirmed?

    if should_send_registration_collaboration_email
      # @todo update email to new template
      user.skip_confirmation_notification!
      user.invite!(inviter)
    else
      # @todo
      # PermitHubMailer.new_submission_collaboration(permit_collaboration).deliver_later
    end
  end

  def build_permit_collaboration(collaborator_id:, collaborator_type:, assigned_requirement_block_id: nil)
    collaborator = Collaborator.find(collaborator_id)

    permit_application.permit_collaborations.build(
      collaborator: collaborator,
      collaborator_type: collaborator_type,
      assigned_requirement_block_id: assigned_requirement_block_id,
    )
  end

  def create_submission_user!(user_params)
    user =
      User.build(
        first_name: user_params[:first_name],
        last_name: user_params[:last_name],
        email: user_params[:email],
        role: :submitter,
      )

    return user if user.save

    raise PermitCollaborationError,
          I18n.t(
            "services.permit_collaboration.collaboration_management.create_user_error",
            error_message: user.errors.full_messages.join(", "),
          )
  end

  def create_collaborator!(inviter, user)
    collaborator = inviter.collaborators.build(user: user)

    return collaborator if collaborator.save

    raise PermitCollaborationError,
          I18n.t(
            "services.permit_collaboration.collaboration_management.add_collaborator_error",
            error_message: collaborator.errors.full_messages.join(", "),
          )
  end
end

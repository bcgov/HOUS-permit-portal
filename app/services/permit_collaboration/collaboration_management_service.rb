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
    ActiveRecord::Base.transaction do
      # a permit application can only have one delegatee, so we need to remove the existing one
      if collaborator_type == "delegatee"
        existing_delegatee_collaboration =
          permit_application.permit_collaborations.where(
            collaborator_type: "delegatee"
          )

        if existing_delegatee_collaboration.length.positive?
          existing_delegatee_collaboration.discard_all
        end
      end

      permit_collaboration =
        build_permit_collaboration(
          collaborator_id: collaborator_id,
          collaborator_type: collaborator_type,
          assigned_requirement_block_id: assigned_requirement_block_id
        )

      unless authorize_collaboration.nil?
        authorize_collaboration.call(permit_collaboration)
      end

      unless permit_collaboration.save
        raise PermitCollaborationError,
              I18n.t(
                "services.permit_collaboration.collaboration_management.assign_collaborator_error",
                error_message:
                  permit_collaboration.errors.full_messages.join(", ")
              )
      end

      PermitHubMailer.notify_permit_collaboration(
        permit_collaboration: permit_collaboration
      )&.deliver_later

      send_collaboration_assignment_notification(permit_collaboration)

      permit_collaboration
    end
  end

  def reinvite!(permit_collaboration)
    # Resends the review collaboration email only. An unconfirmed or discarded
    # reviewer still needs their account invitation from UsersController#reinvite.
    PermitHubMailer.notify_permit_collaboration(
      permit_collaboration: permit_collaboration
    )&.deliver_later
  end

  private

  def send_collaboration_assignment_notification(permit_collaboration)
    NotificationService.publish_permit_collaboration_assignment_event(
      permit_collaboration
    )
  end

  def build_permit_collaboration(
    collaborator_id:,
    collaborator_type:,
    assigned_requirement_block_id: nil
  )
    collaborator = Collaborator.find(collaborator_id)

    permit_application.permit_collaborations.build(
      collaborator: collaborator,
      collaborator_type: collaborator_type,
      assigned_requirement_block_id: assigned_requirement_block_id
    )
  end
end

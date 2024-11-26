class Api::PermitCollaborationsController < Api::ApplicationController
  before_action :set_permit_collaboration, only: %i[reinvite destroy]

  def destroy
    authorize @permit_collaboration

    if @permit_collaboration.destroy
      render_success @permit_collaboration,
                     "permit_collaboration.destroy_success",
                     { blueprint: PermitCollaborationBlueprint }
    else
      render_error "permit_collaboration.destroy_error",
                   message_opts: {
                     error_message:
                       @permit_collaboration.errors.full_messages.join(", ")
                   }
    end
  end

  def reinvite
    authorize @permit_collaboration
    begin
      PermitCollaboration::CollaborationManagementService.new(
        @permit_application
      ).send_submission_collaboration_email!(@permit_collaboration)

      render_success @permit_collaboration,
                     "permit_collaboration.re_invite_success",
                     {
                       blueprint: PermitCollaborationBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    rescue PermitCollaborationError => e
      render_error "permit_collaboration.re_invite_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  private

  def set_permit_collaboration
    @permit_collaboration = PermitCollaboration.find(params[:id])
  end
end

class Api::PermitCollaborationsController < Api::ApplicationController
  before_action :set_permit_collaboration, only: [:destroy]

  def destroy
    authorize @permit_collaboration

    if @permit_collaboration.destroy
      render_success @permit_collaboration,
                     "permit_collaboration.destroy_success",
                     { blueprint: PermitCollaborationBlueprint }
    else
      render_error "permit_collaboration.destroy_error",
                   message_opts: {
                     error_message: @permit_collaboration.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def set_permit_collaboration
    @permit_collaboration = PermitCollaboration.find(params[:id])
  end
end

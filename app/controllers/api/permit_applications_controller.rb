class Api::PermitApplicationsController < Api::ApplicationController
  before_action :set_permit_application, only: %i[show update] #destroy

  def index
    @permit_applications = policy_scope(PermitApplication)
    render_success @permit_applications, nil, { blueprint: PermitApplicationBlueprint }
  end

  def show
    authorize @permit_application
    render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
  end

  def create
    # authorize @permit_application
    # render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
  end

  def update
    authorize @permit_application

    if @permit_application.save
      render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
    else
      render_error Constants::Error.e("permit_application.create_error", "Error creating permit application"),
                   "permit_application.create_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def set_permit_application
    @permit_application = PermitApplication.find(params[:id])
  end
end

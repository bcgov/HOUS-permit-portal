class ExternalApi::V2::ProjectMeetingsController < ExternalApi::ApplicationController
  before_action :set_project_meeting, only: %i[show update]

  def show
    authorize [:external_api, @project_meeting]

    render_project_meeting
  end

  def update
    authorize [:external_api, @project_meeting], :show?

    unless @project_meeting.open?
      return render_schedule_error("Meeting request must be open to schedule.")
    end

    if invalid_contact_method?
      return render_schedule_error("Contact method is invalid.")
    end

    scheduled =
      @project_meeting.with_lock do
        unless @project_meeting.open?
          return(
            render_schedule_error("Meeting request must be open to schedule.")
          )
        end

        @project_meeting.assign_attributes(schedule_params)
        @project_meeting.schedule!
      end

    if scheduled
      render_project_meeting
    else
      render_schedule_error(schedule_error_message)
    end
  rescue AASM::InvalidTransition, ActiveRecord::RecordInvalid
    render_schedule_error(schedule_error_message)
  end

  private

  def expected_api_version
    "v2"
  end

  def render_project_meeting
    render_success @project_meeting,
                   nil,
                   {
                     blueprint: ProjectMeetingBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  def render_schedule_error(message)
    render_error nil,
                 {
                   status: :unprocessable_entity,
                   meta: {
                     message: message,
                     type: "error"
                   }
                 }
  end

  def schedule_error_message
    @project_meeting.errors.full_messages.to_sentence.presence ||
      "Meeting request could not be scheduled."
  end

  def invalid_contact_method?
    value = params[:contact_method]
    value.present? && !ProjectMeeting.contact_methods.key?(value.to_s)
  end

  def schedule_params
    params.permit(:confirmed_date, :contact_method, :meeting_url)
  end

  def set_project_meeting
    @project_meeting =
      ProjectMeeting
        .joins(:permit_project)
        .merge(PermitProject.for_sandbox(current_sandbox))
        .find(params[:id])
  end
end

class Api::ProjectMeetingsController < Api::ApplicationController
  before_action :set_permit_project
  before_action :set_project_meeting, only: %i[show update submit]

  def create
    @project_meeting =
      @permit_project.project_meetings.build(
        requested_by: current_user,
        contact_name: current_user.name,
        contact_email: current_user.email,
        contact_phone_number: current_user.phone_number
      )
    authorize @project_meeting

    if @project_meeting.save
      render_success @project_meeting,
                     "project_meeting.create_success",
                     { blueprint: ProjectMeetingBlueprint, status: :created }
    else
      render_error(
        "project_meeting.create_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: @project_meeting.errors.full_messages
          }
        }
      )
    end
  end

  def show
    authorize @project_meeting
    render_success @project_meeting, nil, { blueprint: ProjectMeetingBlueprint }
  end

  def update
    authorize @project_meeting

    if @project_meeting.update(project_meeting_params)
      render_success @project_meeting,
                     "project_meeting.update_success",
                     { blueprint: ProjectMeetingBlueprint }
    else
      render_error(
        "project_meeting.update_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: @project_meeting.errors.full_messages,
            params: project_meeting_params.to_h
          }
        }
      )
    end
  end

  def submit
    authorize @project_meeting
    @project_meeting.assign_attributes(project_meeting_params)
    @project_meeting.submit_request!
    render_success @project_meeting,
                   "project_meeting.submit_success",
                   { blueprint: ProjectMeetingBlueprint }
  rescue ActiveRecord::RecordInvalid
    render_error(
      "project_meeting.submit_error",
      {
        status: :unprocessable_entity,
        log_args: {
          errors: @project_meeting.errors.full_messages
        }
      }
    )
  end

  private

  def set_permit_project
    scope = PermitProject.includes(:jurisdiction)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_project_meeting
    @project_meeting = @permit_project.project_meetings.find(params[:id])
  end

  def project_meeting_params
    if params[:project_meeting].blank?
      return ActionController::Parameters.new.permit
    end

    params.require(:project_meeting).permit(
      :requester_relationship,
      :contact_name,
      :contact_email,
      :contact_phone_number,
      :project_description,
      :meeting_notes,
      :request_property_information,
      :confirmed_date,
      :meeting_url,
      meeting_request_documents_attributes: [
        :id,
        :project_meeting_id,
        :_destroy,
        file: [:id, :storage, metadata: %i[size filename mime_type]]
      ]
    )
  end
end

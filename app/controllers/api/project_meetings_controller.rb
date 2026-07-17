class Api::ProjectMeetingsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectMeetings

  before_action :set_permit_project, except: %i[show download_calendar]
  before_action :set_project_meeting,
                only: %i[
                  show
                  download_calendar
                  update
                  submit
                  withdraw
                  reschedule
                  transition_status
                  mark_as_viewed
                  mark_as_unviewed
                ]

  def index
    perform_project_meeting_search
    render_success @project_meeting_search.results,
                   nil,
                   {
                     meta: page_meta(@project_meeting_search),
                     blueprint: ProjectMeetingBlueprint
                   }
  end

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
    render_success @project_meeting,
                   nil,
                   {
                     blueprint: ProjectMeetingBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  def download_calendar
    authorize @project_meeting

    if @project_meeting.confirmed_date.blank?
      return(
        render_error(
          "project_meeting.calendar_unavailable",
          { status: :unprocessable_entity }
        )
      )
    end

    generator =
      ProjectMeetingIcsGenerator.new(
        @project_meeting,
        hub_meeting_url: calendar_hub_meeting_url,
        attendee_email: current_user.email
      )

    send_data generator.generate,
              filename: generator.filename,
              type: "text/calendar; method=REQUEST; charset=UTF-8",
              disposition: "attachment"
  end

  def update
    authorize @project_meeting

    if @project_meeting.update(project_meeting_params)
      render_success @project_meeting,
                     "project_meeting.update_success",
                     {
                       blueprint: ProjectMeetingBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
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
  rescue AASM::InvalidTransition, ActiveRecord::RecordInvalid
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

  def withdraw
    authorize @project_meeting

    unless @project_meeting.allowed_manual_transitions.include?(:withdrawn)
      return render_error("project_meeting.invalid_transition", { status: 422 })
    end

    @project_meeting.withdraw!
    render_success @project_meeting,
                   "project_meeting.withdraw_success",
                   { blueprint: ProjectMeetingBlueprint }
  rescue AASM::InvalidTransition, ActiveRecord::RecordInvalid
    render_error(
      "project_meeting.withdraw_error",
      {
        status: :unprocessable_entity,
        log_args: {
          errors: @project_meeting.errors.full_messages
        }
      }
    )
  end

  def reschedule
    authorize @project_meeting
    @project_meeting.assign_attributes(project_meeting_schedule_params)

    if @project_meeting.save
      NotificationService.publish_project_meeting_rescheduled_event(
        @project_meeting
      )
      render_success @project_meeting,
                     "project_meeting.reschedule_success",
                     {
                       blueprint: ProjectMeetingBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error(
        "project_meeting.reschedule_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: @project_meeting.errors.full_messages,
            params: project_meeting_schedule_params.to_h
          }
        }
      )
    end
  end

  def transition_status
    authorize @project_meeting, :transition_status?

    @project_meeting.assign_attributes(project_meeting_params)
    target = params.require(:target_status)
    event = ProjectMeetingStatus::STATUS_EVENT_MAP[target]

    unless event &&
             @project_meeting.allowed_manual_transitions.include?(target.to_sym)
      return render_error("project_meeting.invalid_transition", { status: 422 })
    end

    @project_meeting.send(:"#{event}!")
    render_success @project_meeting,
                   "project_meeting.transition_success",
                   { blueprint: ProjectMeetingBlueprint }
  rescue AASM::InvalidTransition, ActiveRecord::RecordInvalid
    render_error(
      "project_meeting.invalid_transition",
      {
        status: :unprocessable_entity,
        log_args: {
          errors: @project_meeting.errors.full_messages
        }
      }
    )
  end

  def mark_as_viewed
    authorize @project_meeting
    @project_meeting.update_viewed_at
    render_success @project_meeting, nil, { blueprint: ProjectMeetingBlueprint }
  end

  def mark_as_unviewed
    authorize @project_meeting
    @project_meeting.mark_as_unviewed
    render_success @project_meeting, nil, { blueprint: ProjectMeetingBlueprint }
  end

  private

  def set_permit_project
    scope = PermitProject.includes(:jurisdiction)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_project_meeting
    if @permit_project.present?
      @project_meeting =
        @permit_project
          .project_meetings
          .includes(:meeting_request_documents, notes: %i[user permit_project])
          .find(params[:id])
    else
      @project_meeting =
        policy_scope(ProjectMeeting).includes(
          :permit_project,
          :meeting_request_documents,
          notes: %i[user permit_project]
        ).find(params[:id])
    end
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
      :contact_method,
      :confirmed_date,
      :meeting_url,
      meeting_request_documents_attributes: [
        :id,
        :project_meeting_id,
        :document_type,
        :_destroy,
        file: [:id, :storage, metadata: %i[size filename mime_type]]
      ]
    )
  end

  def project_meeting_schedule_params
    if params[:project_meeting].blank?
      return ActionController::Parameters.new.permit
    end

    params.require(:project_meeting).permit(
      :contact_method,
      :confirmed_date,
      :meeting_url
    )
  end

  def calendar_hub_meeting_url
    permit_project = @project_meeting.permit_project
    if current_user.review_staff? &&
         current_user.member_of?(permit_project.jurisdiction_id)
      FrontendUrlHelper.frontend_url(
        "/jurisdictions/#{permit_project.jurisdiction.slug}/submission-inbox/projects/#{permit_project.id}/meetings/#{@project_meeting.id}"
      )
    else
      FrontendUrlHelper.frontend_url(
        "/projects/#{permit_project.id}/meetings/#{@project_meeting.id}"
      )
    end
  end
end

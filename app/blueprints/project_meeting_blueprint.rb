class ProjectMeetingBlueprint < Blueprinter::Base
  identifier :id

  fields :permit_project_id,
         :requested_by_id,
         :status,
         :requester_relationship,
         :contact_name,
         :contact_email,
         :contact_phone_number,
         :project_description,
         :meeting_notes,
         :request_property_information,
         :contact_method,
         :submitted_at,
         :confirmed_date,
         :scheduled_at,
         :completed_at,
         :closed_at,
         :meeting_url,
         :viewed_at,
         :notes_count,
         :created_at,
         :updated_at

  field :allowed_manual_transitions, default: []

  field :project_number do |project_meeting, _options|
    project_meeting.permit_project&.number
  end

  field :project_address do |project_meeting, _options|
    project_meeting.full_address
  end

  field :project_pid do |project_meeting, _options|
    project_meeting.pid
  end

  view :extended do
    include_view :default

    association :meeting_request_documents,
                blueprint: MeetingRequestDocumentBlueprint
  end
end

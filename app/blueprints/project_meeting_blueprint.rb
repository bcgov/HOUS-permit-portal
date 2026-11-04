class ProjectMeetingBlueprint < Blueprinter::Base
  identifier :id

  view :base do
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
           :withdrawn_at,
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
  end

  view :external_api do
    fields :status,
           :requester_relationship,
           :contact_name,
           :contact_email,
           :contact_phone_number,
           :project_description,
           :request_property_information,
           :permit_project_id,
           :contact_method,
           :confirmed_date,
           :meeting_url,
           :scheduled_at

    field :project_number do |project_meeting, _options|
      project_meeting.permit_project&.number
    end

    field :project_address do |project_meeting, _options|
      project_meeting.full_address
    end

    field :project_pid do |project_meeting, _options|
      project_meeting.pid
    end

    field :meeting_request_documents do |project_meeting, _options|
      project_meeting.meeting_request_documents.map do |document|
        {
          id: document.id,
          document_type: document.document_type,
          name: document.file_name,
          type: document.file_type,
          size: document.file_size,
          url: document.file_url
        }
      end
    end
  end

  view :extended do
    include_view :base

    association :meeting_request_documents,
                blueprint: MeetingRequestDocumentBlueprint
    association :notes, blueprint: NoteBlueprint
  end
end

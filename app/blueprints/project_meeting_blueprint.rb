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
         :submitted_at,
         :confirmed_date,
         :scheduled_at,
         :completed_at,
         :closed_at,
         :meeting_url,
         :created_at,
         :updated_at

  field :allowed_manual_transitions, default: []

  view :extended do
    include_view :default

    association :meeting_request_documents,
                blueprint: MeetingRequestDocumentBlueprint
  end
end

class NoteBlueprint < Blueprinter::Base
  identifier :id

  fields :body,
         :noteable_type,
         :noteable_id,
         :permit_project_id,
         :created_at,
         :updated_at

  field :author_name do |note, _options|
    note.user&.name
  end

  field :project_meeting_id do |note, _options|
    note.noteable_id if note.noteable_type == ProjectMeeting.name
  end

  field :project_number do |note, _options|
    note.permit_project&.number
  end

  field :project_address do |note, _options|
    note.permit_project&.full_address
  end
end

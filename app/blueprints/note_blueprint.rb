class NoteBlueprint < Blueprinter::Base
  identifier :id

  fields :body, :noteable_type, :noteable_id, :created_at, :updated_at

  field :author_name do |note, _options|
    note.user&.name
  end

  field :author_email do |note, _options|
    note.user&.email
  end

  field :project_meeting_id do |note, _options|
    note.noteable_id if note.noteable_type == ProjectMeeting.name
  end

  field :permit_project_id do |note, _options|
    if note.noteable.respond_to?(:permit_project_id)
      note.noteable&.permit_project_id
    end
  end

  field :project_number do |note, _options|
    if note.noteable.respond_to?(:permit_project)
      note.noteable.permit_project&.number
    end
  end

  field :project_address do |note, _options|
    note.noteable.full_address if note.noteable.respond_to?(:full_address)
  end

  field :noteable_label do |note, _options|
    case note.noteable_type
    when ProjectMeeting.name
      "Project meeting"
    else
      note.noteable_type
    end
  end
end

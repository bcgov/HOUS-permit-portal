class NoteBlueprint < Blueprinter::Base
  identifier :id

  fields :body,
         :kind,
         :noteable_type,
         :noteable_id,
         :permit_project_id,
         :published_at,
         :created_at,
         :updated_at

  field :permit_application_id do |note, _options|
    if note.noteable_type == "SubmissionVersion"
      note.noteable&.permit_application_id
    end
  end

  field :noteable_label do |note, _options|
    case note.noteable
    when SubmissionVersion
      application = note.noteable.permit_application
      [application&.number, application&.nickname].compact_blank
        .join(" — ")
        .presence
    when ProjectMeeting
      (note.noteable.confirmed_date || note.noteable.submitted_at)&.strftime(
        "%b %-d, %Y"
      )
    end
  end

  field :author_name do |note, _options|
    note.user&.name
  end

  field :project_number do |note, _options|
    note.permit_project&.number
  end

  field :project_address do |note, _options|
    note.permit_project&.full_address
  end

  association :note_attachment_documents,
              blueprint: NoteAttachmentDocumentBlueprint
end

class NoteAttachmentDocumentPolicy < ApplicationPolicy
  # An attachment is downloadable by exactly the people who can see its note.
  def download?
    return false unless user && record.note_id

    NotePolicy::Scope
      .new(user_context, Note.where(id: record.note_id))
      .resolve
      .exists?
  end
end

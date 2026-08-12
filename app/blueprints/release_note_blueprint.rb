class ReleaseNoteBlueprint < Blueprinter::Base
  identifier :id
  fields :version,
         :name,
         :release_type,
         :release_date,
         :release_notes_url,
         :status,
         :updated_at,
         :content,
         :issues,
         :display_label
end

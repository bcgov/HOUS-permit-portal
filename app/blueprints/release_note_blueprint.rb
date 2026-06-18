class ReleaseNoteBlueprint < Blueprinter::Base
  identifier :id
  fields :version,
         :release_date,
         :release_notes_url,
         :status,
         :updated_at,
         :content,
         :issues
end

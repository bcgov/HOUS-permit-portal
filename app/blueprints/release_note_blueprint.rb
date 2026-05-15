class ReleaseNoteBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :version, :release_date, :release_notes_url, :status, :updated_at
  end

  view :extended do
    include_view :base
    fields :content, :issues
  end
end

class NotesExportService
  HEADERS = [
    "Author",
    "Created at",
    "Related item type",
    "Related item id",
    "Project number",
    "Body"
  ].freeze

  def initialize(notes)
    @notes = notes
  end

  def to_csv
    CSV.generate(headers: true) do |csv|
      csv << HEADERS
      notes.each { |note| csv << row_for(note) }
    end
  end

  private

  attr_reader :notes

  def row_for(note)
    [
      note.user&.name,
      note.user&.email,
      note.created_at&.iso8601,
      related_item_type(note),
      note.noteable_id,
      project_number(note),
      plain_body(note)
    ]
  end

  def related_item_type(note)
    return "Project meeting" if note.noteable_type == ProjectMeeting.name

    note.noteable_type
  end

  def project_number(note)
    return unless note.noteable.respond_to?(:permit_project)

    note.noteable.permit_project&.number
  end

  def plain_body(note)
    ActionView::Base.full_sanitizer.sanitize(note.body.to_s).squish
  end
end

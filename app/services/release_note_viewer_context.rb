# Computes list-view pagination context for a release note so clients can open
# /release-notes#release-note-{id} on the correct year and page.
class ReleaseNoteViewerContext
  def self.call(release_note:, scope:, per_page: nil)
    new(release_note:, scope:, per_page:).call
  end

  def initialize(release_note:, scope:, per_page: nil)
    @release_note = release_note
    @scope = scope
    @per_page = per_page
  end

  def call
    year = @release_note.release_date.year
    start_date = Date.new(year, 1, 1)
    end_date = Date.new(year, 12, 31)

    relation =
      @scope.where(release_date: start_date..end_date).order(
        release_date: :desc,
        created_at: :desc
      )

    ahead_count =
      relation.where(
        # Use created_at to break ties when release_date (including time)is the same
        "release_date > ? OR (release_date = ? AND created_at > ?)",
        @release_note.release_date,
        @release_note.release_date,
        @release_note.created_at
      ).count

    {
      release_note_id: @release_note.id,
      year: year,
      page: (ahead_count / resolved_per_page) + 1
    }
  end

  private

  def resolved_per_page
    requested_per_page = @per_page.to_i
    return requested_per_page if requested_per_page.positive?

    Kaminari.config.default_per_page
  end
end

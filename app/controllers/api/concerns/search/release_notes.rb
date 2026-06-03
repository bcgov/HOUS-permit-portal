module Api::Concerns::Search::ReleaseNotes
  extend ActiveSupport::Concern

  SORTABLE_COLUMNS = {
    "release_date" => :release_date,
    "updated_at" => :updated_at,
    "status" => :status
  }.freeze

  def perform_release_note_search
    where_clause = release_note_where_clause
    order = release_note_order
    release_note_policy_scope = policy_scope(ReleaseNote)

    @release_note_search =
      ReleaseNote.search(
        "*",
        where: where_clause,
        order: order,
        page: release_note_page,
        per_page: release_note_per_page,
        scope_results: ->(_relation) { release_note_policy_scope }
      )
  end

  private

  def release_note_search_params
    params.permit(
      :page,
      :per_page,
      :year,
      :published_only,
      sort: %i[field direction]
    )
  end

  def release_note_where_clause
    filters = {}

    if release_note_published_only? || !current_user&.super_admin?
      filters[:status] = "published"
    end

    year = release_note_search_params[:year].presence
    return filters unless year

    start_date = Date.new(year.to_i, 1, 1)
    end_date = Date.new(year.to_i, 12, 31)
    filters.merge(release_date: start_date..end_date)
  end

  def release_note_page
    release_note_search_params[:page].presence || 1
  end

  def release_note_per_page
    release_note_search_params[:per_page].presence ||
      Kaminari.config.default_per_page
  end

  def release_note_order
    sort = release_note_search_params[:sort]
    field = SORTABLE_COLUMNS[sort&.dig(:field).to_s]
    direction = (sort&.dig(:direction).to_s.downcase == "asc" ? :asc : :desc)
    # Use created_at to break ties when release_date (including time) is the same
    if field
      { field => direction, :created_at => direction }
    else
      { release_date: :desc, created_at: :desc }
    end
  end

  def release_note_published_only?
    ActiveModel::Type::Boolean.new.cast(
      release_note_search_params[:published_only]
    )
  end
end

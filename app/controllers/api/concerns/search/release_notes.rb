module Api::Concerns::Search::ReleaseNotes
  extend ActiveSupport::Concern

  SORTABLE_COLUMNS = {
    "release_date" => :release_date,
    "updated_at" => :updated_at,
    "status" => :status
  }.freeze

  def perform_release_note_search
    relation = policy_scope(ReleaseNote)
    relation = apply_release_note_year_filter(relation)
    relation = apply_release_note_order(relation)
    @release_notes = relation.page(release_note_page).per(release_note_per_page)
  end

  private

  def release_note_search_params
    params.permit(:page, :per_page, :year, sort: %i[field direction])
  end

  def apply_release_note_year_filter(relation)
    year = release_note_search_params[:year].presence
    return relation unless year

    start_date = Date.new(year.to_i, 1, 1)
    end_date = Date.new(year.to_i, 12, 31)
    relation.where(release_date: start_date..end_date)
  end

  def release_note_page
    release_note_search_params[:page].presence || 1
  end

  def release_note_per_page
    release_note_search_params[:per_page].presence ||
      Kaminari.config.default_per_page
  end

  def apply_release_note_order(relation)
    sort = release_note_search_params[:sort]
    field = SORTABLE_COLUMNS[sort&.dig(:field).to_s]
    direction = (sort&.dig(:direction).to_s.downcase == "asc" ? :asc : :desc)
    if field
      relation.order(field => direction, :id => direction)
    else
      relation.order(release_date: :desc, id: :desc)
    end
  end
end

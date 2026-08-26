module Api::Concerns::Search::ReleaseNotes
  extend ActiveSupport::Concern

  def perform_release_note_search
    @release_note_search =
      ensure_searchkick_policy_scoped!(
        ReleaseNote,
        ReleaseNote.search(
          "*",
          where: release_note_where_clause,
          order: release_note_order,
          page: release_note_page,
          per_page: release_note_per_page,
          scope_results: ->(relation) { policy_scope(relation) }
        )
      )
  end

  private

  def release_note_search_params
    params.permit(
      :page,
      :per_page,
      :year,
      :published_only,
      :release_type,
      sort: %i[field direction]
    )
  end

  def release_note_where_clause
    filters = {}

    if release_note_published_only? || !current_user&.super_admin?
      filters[:status] = "published"
    end

    release_type = release_note_search_params[:release_type].presence
    if release_type && ReleaseNote.release_types.key?(release_type)
      filters[:release_type] = release_type
    end

    year = release_note_search_params[:year].presence
    return filters unless year

    start_date = Date.new(year.to_i, 1, 1).beginning_of_day
    end_date = Date.new(year.to_i, 12, 31).end_of_day
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
    if (sort = release_note_search_params[:sort])
      {
        sort[:field] => {
          order: sort[:direction],
          unmapped_type: "long"
        },
        :created_at => {
          order: sort[:direction],
          unmapped_type: "long"
        }
      }
    else
      {
        release_date: {
          order: :desc,
          unmapped_type: "long"
        },
        created_at: {
          order: :desc,
          unmapped_type: "long"
        }
      }
    end
  end

  def release_note_published_only?
    ActiveModel::Type::Boolean.new.cast(
      release_note_search_params[:published_only]
    )
  end
end

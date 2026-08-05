module Api::Concerns::Search::RequirementQuestions
  extend ActiveSupport::Concern

  def perform_search
    search_conditions = {
      order: order,
      match: :word_start,
      where: {
        discarded: discarded
      },
      page: search_params[:page],
      per_page:
        (
          if search_params[:page]
            (search_params[:per_page] || Kaminari.config.default_per_page)
          else
            nil
          end
        ),
      # Index only needs block id/name (:extended). Templates load on show (:with_usage).
      includes: %i[taggings requirement_blocks],
      scope_results: ->(relation) { policy_scope(relation) }
    }

    @search =
      ensure_searchkick_policy_scoped!(
        RequirementQuestion,
        RequirementQuestion.search(query, **search_conditions)
      )
  end

  private

  def search_params
    params.permit(
      :query,
      :page,
      :show_archived,
      :per_page,
      sort: %i[field direction]
    )
  end

  def query
    search_params[:query].present? ? search_params[:query] : "*"
  end

  def discarded
    ActiveModel::Type::Boolean.new.cast(search_params[:show_archived] || false)
  end

  def order
    if (sort = search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { updated_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

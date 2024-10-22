module Api::Concerns::Search::Collaborators
  extend ActiveSupport::Concern

  def perform_collaborator_search
    search_conditions = {
      order: collaborator_order,
      match: :word_start,
      where: collaborator_where_clause,
      page: collaborator_search_params[:page],
      per_page:
        (
          if collaborator_search_params[:page]
            (
              collaborator_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        )
    }

    @collaborator_search =
      Collaborator.search(collaborator_query, **search_conditions)
  end

  private

  def collaborator_search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
  end

  def collaborator_query
    if collaborator_search_params[:query].present?
      collaborator_search_params[:query]
    else
      "*"
    end
  end

  def collaborator_order
    if (sort = collaborator_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def collaborator_where_clause
    unless @collaboratorable.present?
      raise ArgumentError, "Missing collaboratorable"
    end

    { collaboratorable_id: @collaboratorable.id }
  end
end

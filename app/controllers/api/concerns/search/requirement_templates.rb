module Api::Concerns::Search::RequirementTemplates
  extend ActiveSupport::Concern

  def perform_search
    @search =
      RequirementTemplate.search(
        query,
        order: order,
        where: {
          discarded: discarded,
          visibility: visibility
        },
        match: :word_start,
        page: search_params[:page],
        per_page:
          (
            if search_params[:page]
              (search_params[:per_page] || Kaminari.config.default_per_page)
            else
              nil
            end
          ),
        includes: model_klass::SEARCH_INCLUDES
      )
  end

  private

  def model_klass
    if search_params[:visibility] == "early_access"
      EarlyAccessRequirementTemplate
    else
      LiveRequirementTemplate
    end
  end

  def search_params
    params.permit(
      :query,
      :show_archived,
      :visibility,
      :page,
      :per_page,
      sort: %i[field direction]
    )
  end

  def visibility
    search_params[:visibility]&.split(",") || "live"
  end

  def query
    search_params[:query].present? ? search_params[:query] : "*"
  end

  def discarded
    search_params[:show_archived].present?
  end

  def order
    if (sort = search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

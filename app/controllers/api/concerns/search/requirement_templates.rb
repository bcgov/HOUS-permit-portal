module Api::Concerns::Search::RequirementTemplates
  extend ActiveSupport::Concern

  def perform_search
    @search =
      RequirementTemplate.search(
        query,
        includes: %i[
          activity
          permit_type
          last_three_deprecated_template_versions
          scheduled_template_versions
          published_template_version
        ],
        order: order,
        where: {
          discarded: discarded,
          early_access: early_access
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
        includes: RequirementTemplate::SEARCH_INCLUDES
      )
  end

  private

  def search_params
    params.permit(
      :query,
      :show_archived,
      :early_access,
      :page,
      :per_page,
      sort: %i[field direction]
    )
  end

  def query
    search_params[:query].present? ? search_params[:query] : "*"
  end

  def discarded
    search_params[:show_archived].present?
  end

  def early_access
    search_params[:early_access].present?
  end

  def order
    if (sort = search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

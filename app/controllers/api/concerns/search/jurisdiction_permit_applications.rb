module Api::Concerns::Search::JurisdictionPermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    search_conditions = {
      order: order,
      match: :word_start,
      where: {
        jurisdiction_id: @jurisdiction&.id,
        discarded: false
      },
      page: permit_application_search_params[:page],
      per_page:
        (
          if permit_application_search_params[:page]
            (
              permit_application_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      includes: PermitApplication::SEARCH_INCLUDES,
      scope_results: ->(relation) { policy_scope(relation) }
    }

    @permit_application_search =
      PermitApplication.search(query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
  end

  def query
    if permit_application_search_params[:query].present?
      permit_application_search_params[:query]
    else
      "*"
    end
  end

  def order
    if (sort = permit_application_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

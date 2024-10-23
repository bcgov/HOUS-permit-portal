module Api::Concerns::Search::JurisdictionPermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    @permit_application_search =
      PermitApplication.search(
        query,
        where: {
          jurisdiction_id: @jurisdiction&.id
        },
        order: order,
        match: :word_start,
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
        includes: PermitApplication::SEARCH_INCLUDES
      )
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

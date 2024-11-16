module ExternalApi::Concerns::Search::PermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    # This search should always be scoped to a jurisdiction via the api key.
    # The following condition should never be true, but is an added reduncy
    # for security purposes.
    if current_external_api_key.blank? ||
         current_external_api_key.jurisdiction_id.blank?
      raise Pundit::NotAuthorizedError
    end

    search_conditions = {
      order: permit_application_order,
      match: :word_start,
      where: permit_application_where_clause,
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
    }

    @permit_application_search =
      PermitApplication.search(permit_application_query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(
      :page,
      :per_page,
      constraints: [
        :permit_classifications,
        :status,
        submitted_at: %i[gt lt gte lte],
        resubmitted_at: %i[gt lt gte lte]
      ],
      sort: %i[field direction]
    )
  end

  def permit_application_query
    # We do not support querying for permit applications for external apis
    "*"
  end

  def permit_application_order
    if (sort = permit_application_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { submitted_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def permit_application_where_clause
    constraints = permit_application_search_params[:constraints]

    where = {
      jurisdiction_id: current_external_api_key.jurisdiction_id,
      # TODO: Support sandboxes in external API
      sandbox_id: nil
    }

    where[:status] = %i[newly_submitted resubmitted] if constraints.blank? ||
      constraints[:status].blank?

    where.merge!(constraints.to_h.deep_symbolize_keys) if constraints.present?

    where
  end
end

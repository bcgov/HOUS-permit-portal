module Api::Concerns::Search::ProjectPermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    search_conditions = {
      order: permit_application_order,
      match: :word_start,
      fields: [
        { number: :text_end },
        { nickname: :word_middle },
        { full_address: :word_middle },
        { permit_classifications: :word_middle },
        { submitter: :word_middle },
        { status: :word_middle },
        { review_delegatee_name: :word_middle }
      ],
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
      :query,
      :page,
      :per_page,
      filters: [
        :requirement_template_id,
        :template_version_id,
        { status: [] },
        :has_collaborator
      ],
      sort: %i[field direction]
    )
  end

  def permit_application_query
    if permit_application_search_params[:query].present?
      permit_application_search_params[:query]
    else
      "*"
    end
  end

  def permit_application_order
    if (sort = permit_application_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { number: { order: :desc, unmapped_type: "long" } }
    end
  end

  def permit_application_where_clause
    filters = permit_application_search_params[:filters] || {}

    where = { permit_project_id: @permit_project.id }
    where[:sandbox_id] = current_sandbox&.id if !current_user.super_admin?

    (filters&.to_h || {}).deep_symbolize_keys.compact.merge!(where)
  end
end

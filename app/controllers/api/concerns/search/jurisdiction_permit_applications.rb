module Api::Concerns::Search::JurisdictionPermitApplications
  extend ActiveSupport::Concern

  def perform_jurisdiction_permit_application_search
    search_conditions = {
      order: jurisdiction_permit_application_order,
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
      where: jurisdiction_permit_application_where_clause,
      page: jurisdiction_permit_application_search_params[:page],
      per_page:
        (
          if jurisdiction_permit_application_search_params[:page]
            (
              jurisdiction_permit_application_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      includes: PermitApplication::SEARCH_INCLUDES,
      scope_results: ->(relation) { policy_scope(relation) }
    }
    @jurisdiction_permit_application_search =
      PermitApplication.search(
        jurisdiction_permit_application_query,
        **search_conditions
      )
  end

  private

  def jurisdiction_permit_application_search_params
    params.permit(
      :query,
      :show_archived,
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

  def jurisdiction_permit_application_query
    if jurisdiction_permit_application_search_params[:query].present?
      jurisdiction_permit_application_search_params[:query]
    else
      "*"
    end
  end

  def jurisdiction_permit_application_order
    if (sort = jurisdiction_permit_application_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { number: { order: :desc, unmapped_type: "long" } }
    end
  end

  def jurisdiction_permit_application_where_clause
    filters = jurisdiction_permit_application_search_params[:filters] || {}
    filters[:has_collaborator] = (
      if filters[:has_collaborator] == false
        nil
      else
        filters[:has_collaborator]
      end
    )

    where = {
      jurisdiction_id: @jurisdiction.id,
      status: %i[newly_submitted resubmitted]
    }
    where[:sandbox_id] = current_sandbox&.id unless current_user.super_admin?
    where[:discarded] = jurisdiction_permit_application_discarded

    (filters.to_h || {}).deep_symbolize_keys.compact_blank.merge!(where)
  end

  def jurisdiction_permit_application_discarded
    ActiveModel::Type::Boolean.new.cast(
      jurisdiction_permit_application_search_params[:show_archived] || false
    )
  end
end

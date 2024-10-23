module Api::Concerns::Search::PermitApplications
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
      filters: [:requirement_template_id, :template_version_id, { status: [] }],
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
    elsif current_user.submitter?
      { created_at: { order: :desc, unmapped_type: "long" } }
    else
      { number: { order: :desc, unmapped_type: "long" } }
    end
  end

  def permit_application_where_clause
    filters = permit_application_search_params[:filters]
    where = {}

    # Add the submitter ID if the user is a submitter. Necessary even with search auth filtering for consisent pagination
    # Only add the jurisdiction_id condition if @jurisdiction is present
    if @jurisdiction
      where = {
        jurisdiction_id: @jurisdiction.id,
        sandbox_id: current_sandbox&.id,
        # Overrides status filter, reorder the code if necessary
        status: %i[newly_submitted resubmitted]
      }
    else
      where = {
        user_ids_with_submission_edit_permissions: current_user.id,
        sandbox_id: nil
      }
    end
    ret = (filters&.to_h || {}).deep_symbolize_keys.compact.merge!(where)

    ret
  end
end

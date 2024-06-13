module Api::Concerns::Search::PermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    search_conditions = {
      order: permit_application_order,
      match: :word_start,
      page: permit_application_search_params[:page],
      per_page:
        (
          if permit_application_search_params[:page]
            (permit_application_search_params[:per_page] || Kaminari.config.default_per_page)
          else
            nil
          end
        ),
    }

    search_conditions.merge!({ where: {} })

    if permit_application_search_params[:status].present?
      search_conditions[:where][:status] = permit_application_search_params[:status]
    end

    if permit_application_search_params[:requirement_template_id].present?
      search_conditions[:where][:requirement_template_id] = permit_application_search_params[:requirement_template_id]
    end

    if permit_application_search_params[:template_version_id].present?
      search_conditions[:where][:template_version_id] = permit_application_search_params[:template_version_id]
    end

    # Add the submitter ID if the user is a submitter. Necessary even with search auth filtering for consisent pagination
    # Only add the jurisdiction_id condition if @jurisdiction is present
    if @jurisdiction
      search_conditions[:where] = {
        jurisdiction_id: @jurisdiction.id,
        # Overrides status filter, reorder the code if necessary
        status: %i[submitted],
      }
    else
      search_conditions[:where] = search_conditions[:where].merge({ submitter_id: current_user.id })
    end

    @permit_application_search = PermitApplication.search(permit_application_query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      :status,
      :template_version_id,
      :requirement_template_id,
      sort: %i[field direction],
    )
  end

  def permit_application_query
    permit_application_search_params[:query].present? ? permit_application_search_params[:query] : "*"
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
end

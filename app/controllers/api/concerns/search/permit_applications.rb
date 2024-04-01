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
    if permit_application_search_params[:status_filter].present?
      search_conditions[:where][:status] = permit_application_search_params[:status_filter]
    end

    # Add the submitter ID if the user is a submitter. Necessary even with search auth filtering for consisent pagination
    # Only add the jurisdiction_id condition if @jurisdiction is present
    if current_user.submitter?
      search_conditions[:where] = search_conditions[:where].merge({ submitter_id: current_user.id })
    elsif current_user.review_staff?
      raise StandardError unless @jurisdiction.present?

      search_conditions[:where] = {
        jurisdiction_id: @jurisdiction.id,
        # Overrides status filter, reorder the code if necessary
        status: %i[submitted],
      }
    elsif current_user.super_admin?
      return
    end

    @permit_application_search = PermitApplication.search(permit_application_query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(:query, :page, :per_page, :status_filter, sort: %i[field direction])
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

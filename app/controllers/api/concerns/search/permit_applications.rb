module Api::Concerns::Search::PermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    search_conditions = {
      order: order,
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

    # Add the submitter ID if the user is a submitter. Necessary even with search auth filtering for consisent pagination
    # Only add the jurisdiction_id condition if @jurisdiction is present
    if current_user.submitter?
      search_conditions[:where] = { submitter_id: current_user.id }
    elsif @jurisdiction.present?
      search_conditions[:where] = { jurisdiction_id: @jurisdiction.id, status: %i[submitted viewed] }
    end
    @permit_application_search = PermitApplication.search(query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
  end

  def query
    permit_application_search_params[:query].present? ? permit_application_search_params[:query] : "*"
  end

  def order
    if (sort = permit_application_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

module Api::Concerns::Search::ProjectMeetings
  extend ActiveSupport::Concern

  def perform_project_meeting_search
    search_conditions = {
      order: project_meeting_order,
      match: :word_start,
      fields: [
        { contact_name: :word_middle },
        { contact_email: :word_middle },
        { project_description: :word_middle },
        { meeting_notes: :word_middle },
        { status: :word_middle }
      ],
      where: project_meeting_where_clause,
      page: project_meeting_search_params[:page],
      per_page:
        (
          if project_meeting_search_params[:page]
            (
              project_meeting_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      includes: ProjectMeeting::SEARCH_INCLUDES,
      scope_results: ->(relation) { policy_scope(relation) }
    }

    @project_meeting_search =
      ProjectMeeting.search(project_meeting_query, **search_conditions)
  end

  private

  def project_meeting_search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
  end

  def project_meeting_query
    project_meeting_search_params[:query].presence || "*"
  end

  def project_meeting_order
    if (sort = project_meeting_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { submitted_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def project_meeting_where_clause
    { permit_project_id: @permit_project.id }
  end
end

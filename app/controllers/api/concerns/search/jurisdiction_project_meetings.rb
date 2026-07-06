module Api::Concerns::Search::JurisdictionProjectMeetings
  extend ActiveSupport::Concern

  def perform_jurisdiction_project_meeting_search
    search_conditions = {
      order: jurisdiction_project_meeting_order,
      match: :word_middle,
      fields: jurisdiction_project_meeting_search_fields,
      where: jurisdiction_project_meeting_where_clause,
      page: jurisdiction_project_meeting_search_params[:page],
      per_page:
        (
          if jurisdiction_project_meeting_search_params[:page]
            (
              jurisdiction_project_meeting_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      includes: ProjectMeeting::SEARCH_INCLUDES,
      scope_results: ->(relation) { policy_scope(relation) }
    }

    @jurisdiction_project_meeting_search =
      ensure_searchkick_policy_scoped!(
        ProjectMeeting,
        ProjectMeeting.search(
          jurisdiction_project_meeting_query,
          **search_conditions
        )
      )

    @jurisdiction_project_meetings =
      @jurisdiction_project_meeting_search.results
    @jurisdiction_project_meeting_meta = {
      total_pages: @jurisdiction_project_meeting_search.total_pages,
      current_page: @jurisdiction_project_meeting_search.current_page,
      total_count: @jurisdiction_project_meeting_search.total_count,
      status_counts: jurisdiction_project_meeting_status_counts,
      unread_count: jurisdiction_project_meeting_unread_count
    }
  end

  private

  def jurisdiction_project_meeting_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [{ status: [] }, :unread],
      sort: %i[field direction]
    )
  end

  def jurisdiction_project_meeting_search_fields
    [
      { project_number: :word_middle },
      { project_address: :word_middle },
      { project_pid: :word_middle },
      { contact_name: :word_middle },
      { contact_email: :word_middle },
      { project_description: :word_middle },
      { meeting_notes: :word_middle },
      { status: :word_middle }
    ]
  end

  def jurisdiction_project_meeting_query
    jurisdiction_project_meeting_search_params[:query].presence || "*"
  end

  def jurisdiction_project_meeting_order
    sort = jurisdiction_project_meeting_search_params[:sort]
    return { submitted_at: { order: :desc, unmapped_type: "long" } } unless sort

    { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
  end

  def jurisdiction_project_meeting_status_counts
    ProjectMeeting.search(
      "*",
      where: {
        _and: jurisdiction_project_meeting_base_conditions
      },
      aggs: [:status],
      body_options: {
        size: 0
      }
    ).aggs[
      "status"
    ][
      "buckets"
    ].each_with_object({}) do |bucket, hash|
      next if bucket["key"] == "draft"

      hash[bucket["key"]] = bucket["doc_count"]
    end
  rescue => e
    Rails.logger.warn("Failed to compute meeting status counts: #{e.message}")
    {}
  end

  def jurisdiction_project_meeting_unread_count
    ProjectMeeting.search(
      "*",
      where: {
        _and:
          jurisdiction_project_meeting_base_conditions + [{ viewed_at: nil }]
      },
      body_options: {
        size: 0
      }
    ).total_count
  rescue => e
    Rails.logger.warn("Failed to compute unread meeting count: #{e.message}")
    0
  end

  def jurisdiction_project_meeting_where_clause
    search_filters =
      (jurisdiction_project_meeting_search_params[:filters] || {}).deep_dup

    and_conditions = jurisdiction_project_meeting_base_conditions

    statuses = Array(search_filters.delete(:status)).map(&:to_s) - ["draft"]
    and_conditions << { status: statuses } if statuses.present?

    unread = search_filters.delete(:unread)
    if unread == "only_show"
      and_conditions << { viewed_at: nil }
    elsif unread == "hide"
      and_conditions << { _not: { viewed_at: nil } }
    end

    { _and: and_conditions }
  end

  def jurisdiction_project_meeting_base_conditions
    conditions = [
      { jurisdiction_id: @jurisdiction.id },
      { discarded: false },
      { status: { not: "draft" } }
    ]
    unless current_user.super_admin?
      conditions << { sandbox_id: current_sandbox&.id }
    end
    conditions
  end
end

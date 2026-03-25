module Api::Concerns::Search::JurisdictionPermitProjects
  extend ActiveSupport::Concern

  def perform_jurisdiction_permit_project_search
    search_conditions = {
      order: jurisdiction_permit_project_order,
      match: :word_middle,
      where: jurisdiction_permit_project_where_clause,
      page: jurisdiction_permit_project_search_params[:page],
      per_page:
        (
          if jurisdiction_permit_project_search_params[:page]
            (
              jurisdiction_permit_project_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      includes: [
        :owner,
        :jurisdiction,
        { permit_applications: :collaborators }
      ],
      load: false
    }

    @jurisdiction_permit_project_search =
      PermitProject.search(
        jurisdiction_permit_project_query,
        **search_conditions
      )
    ids = @jurisdiction_permit_project_search.hits.map { |h| h["_id"] }
    loaded =
      policy_scope(PermitProject)
        .with_status_counts
        .includes(:owner, :jurisdiction, permit_applications: :collaborators)
        .where(id: ids)

    @jurisdiction_permit_projects = loaded.sort_by { |p| ids.index(p.id) }
    @jurisdiction_permit_project_meta = {
      total_pages: @jurisdiction_permit_project_search.total_pages,
      current_page: @jurisdiction_permit_project_search.current_page,
      total_count: @jurisdiction_permit_project_search.total_count,
      state_counts: jurisdiction_state_counts
    }
  end

  private

  def jurisdiction_state_counts
    agg_search =
      PermitProject.search(
        "*",
        where: {
          jurisdiction_id: @jurisdiction.id,
          discarded: false,
          state: {
            not: "draft"
          }
        },
        aggs: [:state],
        body_options: {
          size: 0
        }
      )
    agg_search.aggs["state"]["buckets"].each_with_object({}) do |bucket, hash|
      hash[bucket["key"]] = bucket["doc_count"]
    end
  rescue => e
    Rails.logger.warn("Failed to compute state counts: #{e.message}")
    {}
  end

  def jurisdiction_permit_project_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [
        { requirement_template_ids: [] },
        { status: [] },
        :unread,
        :meeting_request,
        { assigned: [] },
        { days_in_queue: %i[operator days] }
      ],
      sort: %i[field direction]
    )
  end

  def jurisdiction_permit_project_query
    jurisdiction_permit_project_search_params[:query].presence || "*"
  end

  def jurisdiction_permit_project_order
    if (sort = jurisdiction_permit_project_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def jurisdiction_permit_project_where_clause
    search_filters =
      (jurisdiction_permit_project_search_params[:filters] || {}).deep_dup

    and_conditions = []
    and_conditions << { jurisdiction_id: @jurisdiction.id }
    and_conditions << { discarded: false }
    and_conditions << { state: { not: "draft" } }

    # if !current_user.super_admin?
    #   and_conditions << { sandbox_id: current_sandbox&.id }
    # end

    requirement_template_ids = search_filters.delete(:requirement_template_ids)
    if requirement_template_ids.present?
      and_conditions << { requirement_template_ids: requirement_template_ids }
    end

    statuses = search_filters.delete(:status)
    and_conditions << { rollup_status: statuses } if statuses.present?

    unread = search_filters.delete(:unread)
    if unread == "only_show"
      and_conditions << { viewed_at: nil }
    elsif unread == "hide"
      and_conditions << { _not: { viewed_at: nil } }
    end

    days_in_queue = search_filters.delete(:days_in_queue)
    if days_in_queue.present? && days_in_queue[:days].present?
      days = days_in_queue[:days].to_i
      cutoff = days.days.ago.beginning_of_day
      if days_in_queue[:operator] == "gte"
        and_conditions << { enqueued_at: { lte: cutoff } }
      elsif days_in_queue[:operator] == "lt"
        and_conditions << { enqueued_at: { gt: cutoff } }
      end
    end

    # ### SUBMISSION INDEX STUB FEATURE - meeting_request, assigned

    { _and: and_conditions }
  end
end

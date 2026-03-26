module Api::Concerns::Search::JurisdictionPermitProjects
  extend ActiveSupport::Concern

  def perform_jurisdiction_permit_project_search
    if jurisdiction_permit_project_search_params[:mode] == "kanban"
      perform_kanban_permit_project_search
    else
      perform_list_permit_project_search
    end
  end

  def perform_list_permit_project_search
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

  def perform_kanban_permit_project_search
    per_column =
      (jurisdiction_permit_project_search_params[:per_column] || 10).to_i
    query = jurisdiction_permit_project_query
    order = jurisdiction_permit_project_order

    user_statuses =
      (
        jurisdiction_permit_project_search_params.dig(:filters, :status) || []
      ).map(&:to_s)

    all_ids = []
    column_totals = {}

    PermitProject.kanban_states.each do |state|
      if user_statuses.present? && user_statuses.exclude?(state)
        column_totals[state] = 0
        next
      end

      where = jurisdiction_permit_project_where_clause(state_filter: state)
      search =
        PermitProject.search(
          query,
          order: order,
          match: :word_middle,
          where: where,
          per_page: per_column,
          page: 1,
          load: false
        )
      ids = search.hits.map { |h| h["_id"] }
      all_ids.concat(ids)
      column_totals[state] = search.total_count
    end

    loaded =
      policy_scope(PermitProject)
        .with_status_counts
        .includes(:owner, :jurisdiction, permit_applications: :collaborators)
        .where(id: all_ids)

    @jurisdiction_permit_projects = loaded.sort_by { |p| all_ids.index(p.id) }
    @jurisdiction_permit_project_meta = {
      total_pages: 1,
      current_page: 1,
      total_count: all_ids.length,
      state_counts: jurisdiction_state_counts,
      column_totals: column_totals
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
      next if bucket["key"] == "draft"
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
      :mode,
      :per_column,
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

  def jurisdiction_permit_project_where_clause(state_filter: nil)
    search_filters =
      (jurisdiction_permit_project_search_params[:filters] || {}).deep_dup

    and_conditions = []
    and_conditions << { jurisdiction_id: @jurisdiction.id }
    and_conditions << { discarded: false }

    statuses = search_filters.delete(:status)

    if state_filter
      and_conditions << { state: state_filter }
    else
      and_conditions << {
        state: statuses.present? ? statuses : { not: "draft" }
      }
    end

    # if !current_user.super_admin?
    #   and_conditions << { sandbox_id: current_sandbox&.id }
    # end

    requirement_template_ids = search_filters.delete(:requirement_template_ids)
    if requirement_template_ids.present?
      and_conditions << { requirement_template_ids: requirement_template_ids }
    end

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

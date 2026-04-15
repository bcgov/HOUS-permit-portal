module Api::Concerns::Search::JurisdictionPermitApplications
  extend ActiveSupport::Concern

  def perform_jurisdiction_permit_application_search
    if jurisdiction_permit_application_search_params[:mode] == "kanban"
      perform_kanban_permit_application_search
    else
      perform_list_permit_application_search
    end
  end

  def perform_list_permit_application_search
    search_conditions = {
      order: jurisdiction_permit_application_order,
      match: :word_start,
      fields: jurisdiction_permit_application_search_fields,
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

    body_opts = jurisdiction_permit_application_body_options
    search_conditions[:body_options] = body_opts if body_opts.present?

    @jurisdiction_permit_application_search =
      PermitApplication.search(
        jurisdiction_permit_application_query,
        **search_conditions
      )

    @jurisdiction_permit_application_meta = {
      total_pages: @jurisdiction_permit_application_search.total_pages,
      current_page: @jurisdiction_permit_application_search.current_page,
      total_count: @jurisdiction_permit_application_search.total_count,
      status_counts: jurisdiction_application_status_counts
    }

    @jurisdiction_permit_applications =
      @jurisdiction_permit_application_search.results
  end

  def perform_kanban_permit_application_search
    per_column =
      (jurisdiction_permit_application_search_params[:per_column] || 10).to_i
    query = jurisdiction_permit_application_query
    order = jurisdiction_permit_application_order

    user_statuses =
      (
        jurisdiction_permit_application_search_params.dig(:filters, :status) ||
          []
      ).map(&:to_s)

    all_ids = []
    column_totals = {}

    PermitApplication.kanban_statuses.each do |status|
      if user_statuses.present? && user_statuses.exclude?(status)
        column_totals[status] = 0
        next
      end

      where =
        jurisdiction_permit_application_where_clause(status_filter: status)
      kanban_conditions = {
        order: order,
        match: :word_start,
        fields: jurisdiction_permit_application_search_fields,
        where: where,
        per_page: per_column,
        page: 1,
        load: false
      }

      body_opts = jurisdiction_permit_application_body_options
      kanban_conditions[:body_options] = body_opts if body_opts.present?

      search = PermitApplication.search(query, **kanban_conditions)
      ids = search.hits.map { |h| h["_id"] }
      all_ids.concat(ids)
      column_totals[status] = search.total_count
    end

    loaded =
      policy_scope(PermitApplication).includes(
        *PermitApplication::SEARCH_INCLUDES
      ).where(id: all_ids)

    @jurisdiction_permit_applications =
      loaded.sort_by { |pa| all_ids.index(pa.id) }
    @jurisdiction_permit_application_meta = {
      total_pages: 1,
      current_page: 1,
      total_count: all_ids.length,
      status_counts: jurisdiction_application_status_counts,
      column_totals: column_totals
    }
  end

  QUEUE_CLOCK_SCRIPT =
    "long total = doc['queue_time_seconds'].value; " \
      "if (doc['queue_clock_started_at'].size() > 0) { " \
      "total += params.now_seconds - doc['queue_clock_started_at'].value } " \
      "return total"

  private

  def jurisdiction_application_status_counts
    and_conditions = []
    and_conditions << { jurisdiction_id: @jurisdiction.id }
    and_conditions << { discarded: false }
    and_conditions << { status: { not: "new_draft" } }
    unless current_user.super_admin?
      and_conditions << { sandbox_id: current_sandbox&.id }
    end

    permit_project_id =
      jurisdiction_permit_application_search_params[:permit_project_id]
    if permit_project_id.present?
      and_conditions << { permit_project_id: permit_project_id }
    end

    agg_search =
      PermitApplication.search(
        "*",
        where: {
          _and: and_conditions
        },
        aggs: [:status],
        body_options: {
          size: 0
        }
      )
    agg_search.aggs["status"]["buckets"].each_with_object({}) do |bucket, hash|
      next if bucket["key"] == "new_draft"
      hash[bucket["key"]] = bucket["doc_count"]
    end
  rescue => e
    Rails.logger.warn(
      "Failed to compute application status counts: #{e.message}"
    )
    {}
  end

  def jurisdiction_permit_application_search_params
    params.permit(
      :query,
      :show_archived,
      :page,
      :per_page,
      :mode,
      :per_column,
      :permit_project_id,
      filters: [
        :requirement_template_id,
        :template_version_id,
        { status: [] },
        :has_collaborator,
        :unread,
        { requirement_template_ids: [] },
        { days_in_queue: %i[operator days] },
        { assigned: [] }
      ],
      sort: %i[field direction]
    )
  end

  def jurisdiction_permit_application_search_fields
    [
      { number: :text_end },
      { nickname: :word_middle },
      { full_address: :word_middle },
      { permit_classifications: :word_middle },
      { submitter: :word_middle },
      { status: :word_middle },
      { review_delegatee_name: :word_middle }
    ]
  end

  def jurisdiction_permit_application_query
    jurisdiction_permit_application_search_params[:query].presence || "*"
  end

  def jurisdiction_permit_application_order
    sort = jurisdiction_permit_application_search_params[:sort]
    return { number: { order: :desc, unmapped_type: "long" } } unless sort

    if sort[:field] == "days_in_queue"
      nil
    else
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    end
  end

  def jurisdiction_permit_application_body_options
    opts = {}
    filters =
      (jurisdiction_permit_application_search_params[:filters] || {}).deep_dup

    days_in_queue = filters[:days_in_queue]
    if days_in_queue.present? && days_in_queue[:days].present?
      days = days_in_queue[:days].to_i
      threshold_seconds = days * 86_400
      comparator = days_in_queue[:operator] == "gte" ? ">=" : "<"

      opts[:post_filter] = {
        script: {
          script: {
            source: QUEUE_CLOCK_SCRIPT + " #{comparator} params.threshold",
            params: {
              now_seconds: Time.current.to_i,
              threshold: threshold_seconds
            }
          }
        }
      }
    end

    sort = jurisdiction_permit_application_search_params[:sort]
    if sort.present? && sort[:field] == "days_in_queue"
      direction =
        %w[asc desc].include?(sort[:direction]) ? sort[:direction] : "desc"
      opts[:sort] = [
        {
          _script: {
            type: "number",
            script: {
              source: QUEUE_CLOCK_SCRIPT,
              params: {
                now_seconds: Time.current.to_i
              }
            },
            order: direction
          }
        }
      ]
    end

    opts
  end

  def jurisdiction_permit_application_where_clause(status_filter: nil)
    search_filters =
      (jurisdiction_permit_application_search_params[:filters] || {}).deep_dup

    and_conditions = []
    and_conditions << { jurisdiction_id: @jurisdiction.id }
    and_conditions << { discarded: jurisdiction_permit_application_discarded }

    statuses = search_filters.delete(:status)

    if status_filter
      and_conditions << { status: status_filter }
    else
      and_conditions << {
        status: statuses.present? ? statuses : { not: "new_draft" }
      }
    end

    unless current_user.super_admin?
      and_conditions << { sandbox_id: current_sandbox&.id }
    end

    requirement_template_ids = search_filters.delete(:requirement_template_ids)
    if requirement_template_ids.present?
      and_conditions << { requirement_template_id: requirement_template_ids }
    end

    unread = search_filters.delete(:unread)
    if unread == "only_show"
      and_conditions << { viewed_at: nil }
    elsif unread == "hide"
      and_conditions << { _not: { viewed_at: nil } }
    end

    search_filters.delete(:days_in_queue)

    assigned = search_filters.delete(:assigned)
    if assigned.present?
      and_conditions << { review_collaborator_user_ids: assigned }
    end

    permit_project_id =
      jurisdiction_permit_application_search_params[:permit_project_id]
    if permit_project_id.present?
      and_conditions << { permit_project_id: permit_project_id }
    end

    { _and: and_conditions }
  end

  def jurisdiction_permit_application_discarded
    ActiveModel::Type::Boolean.new.cast(
      jurisdiction_permit_application_search_params[:show_archived] || false
    )
  end
end

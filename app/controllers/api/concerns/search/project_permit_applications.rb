module Api::Concerns::Search::ProjectPermitApplications
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
      includes: PermitApplication::SEARCH_INCLUDES,
      scope_results: ->(relation) { policy_scope(relation) }
    }

    @permit_application_search =
      PermitApplication.search(permit_application_query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(
      :query,
      :show_archived,
      :page,
      :per_page,
      filters: [
        :requirement_template_id,
        :template_version_id,
        { status: [] },
        :has_collaborator,
        { submission_delegatee_id: [] }
      ],
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
    else
      { number: { order: :desc, unmapped_type: "long" } }
    end
  end

  def permit_application_where_clause
    search_filters =
      (
        permit_application_search_params[:filters].to_h || {}
      ).deep_symbolize_keys.compact_blank

    and_conditions = []
    and_conditions << { permit_project_id: @permit_project.id }
    if !current_user.super_admin?
      and_conditions << { sandbox_id: current_sandbox&.id }
    end
    and_conditions << { discarded: discarded }

    search_filters.each do |key, value|
      case key
      when :requirement_template_id
        and_conditions << { requirement_template_id: value.split(",") }
      when :status
        and_conditions << { status: value }
      when :submission_delegatee_id
        and_conditions << { submission_delegatee_id: value }
      else
        and_conditions << { key => value }
      end
    end

    { _and: and_conditions }
  end

  def discarded
    ActiveModel::Type::Boolean.new.cast(
      permit_application_search_params[:show_archived] || false
    )
  end
end

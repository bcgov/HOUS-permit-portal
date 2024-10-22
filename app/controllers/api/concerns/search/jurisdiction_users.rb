module Api::Concerns::Search::JurisdictionUsers
  extend ActiveSupport::Concern

  def perform_user_search
    @user_search =
      User.search(
        user_query,
        where: {
          jurisdiction_ids: [@jurisdiction&.id],
          discarded: discarded,
          # Only show the review managers if current user is a super admin, but also show reviewers if a review manager
          role:
            (
              if current_user.super_admin?
                %w[review_manager regional_review_manager]
              elsif current_user.review_manager? ||
                    current_user.regional_review_manager?
                %w[regional_review_manager review_manager reviewer]
              else
                nil
              end
            )
        },
        order: user_order,
        match: :word_start,
        page: user_search_params[:page],
        per_page:
          (
            if user_search_params[:page]
              (
                user_search_params[:per_page] ||
                  Kaminari.config.default_per_page
              )
            else
              nil
            end
          )
      )
  end

  private

  def user_search_params
    params.permit(
      :query,
      :show_archived,
      :page,
      :per_page,
      sort: %i[field direction]
    )
  end

  def user_query
    user_search_params[:query].present? ? user_search_params[:query] : "*"
  end

  def discarded
    user_search_params[:show_archived].present?
  end

  def user_order
    if (sort = user_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

class Api::RequirementTemplatesController < Api::ApplicationController
  include Api::Concerns::Search::RequirementTemplates

  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_search
    authorized_results = apply_search_authorization(@search.results)
    render_success @search.results,
                   nil,
                   {
                     meta: {
                       total_pages: @search.total_pages,
                       total_count: @search.total_count,
                       current_page: @search.current_page,
                     },
                     blueprint: RequirementTemplateBlueprint,
                   }
  end

  private
end

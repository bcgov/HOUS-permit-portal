module Api::Concerns::Search::RequirementBlocks
  extend ActiveSupport::Concern

  def perform_search
    @search = RequirementBlock.search(query, order: order)
  end

  private

  def search_params
    params.permit(:query, sort: %i[field direction])
  end

  def query
    search_params[:query].present? ? search_params[:query] : "*"
  end

  def order
    if (sort = search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end

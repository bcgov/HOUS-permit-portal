module Api::Concerns::Search::RequirementBlocks
  extend ActiveSupport::Concern

  def perform_search
    @search =
      RequirementBlock.search(
        query,
        order: order,
        match: :word_start,
        page: search_params[:page],
        per_page: search_params[:page] ? (search_params[:per_page] || Kaminari.config.default_per_page) : nil,
      )
  end

  private

  def search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
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

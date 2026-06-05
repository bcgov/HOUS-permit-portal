class Api::TagsController < Api::ApplicationController
  def index
    escaped_query =
      ActiveRecord::Base.sanitize_sql_like(tag_params[:query].to_s)

    render json:
             policy_scope(
               ActsAsTaggableOn::Tag,
               policy_scope_class: TagPolicy::Scope
             )
               .where(
                 "taggings.taggable_type IN (:taggable_types) AND tags.name ILIKE :query",
                 {
                   taggable_types: tag_params[:taggable_types],
                   query: "%#{escaped_query}%"
                 }
               )
               .uniq
               .pluck(:name)
  end

  private

  def tag_params
    params.require(:search).permit(:query, taggable_types: [])
  end
end

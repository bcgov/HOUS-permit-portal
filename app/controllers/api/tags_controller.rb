class Api::TagsController < Api::ApplicationController
  def index
    render json:
             policy_scope(
               ActsAsTaggableOn::Tag,
               policy_scope_class: TagPolicy::Scope
             )
               .where(
                 "taggings.taggable_type IN (:taggable_types) AND tags.name ILIKE :query",
                 {
                   taggable_types: tag_params[:taggable_types],
                   query: "#{tag_params[:query]}%"
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

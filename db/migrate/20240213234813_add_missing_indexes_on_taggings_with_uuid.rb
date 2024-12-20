# frozen_string_literal: true

class AddMissingIndexesOnTaggingsWithUuid < ActiveRecord::Migration[6.0]
  def change
    unless index_exists? ActsAsTaggableOn.taggings_table, :tag_id
      add_index ActsAsTaggableOn.taggings_table, :tag_id
    end
    unless index_exists? ActsAsTaggableOn.taggings_table, :taggable_id
      add_index ActsAsTaggableOn.taggings_table, :taggable_id
    end
    unless index_exists? ActsAsTaggableOn.taggings_table, :taggable_type
      add_index ActsAsTaggableOn.taggings_table, :taggable_type
    end
    unless index_exists? ActsAsTaggableOn.taggings_table, :tagger_id
      add_index ActsAsTaggableOn.taggings_table, :tagger_id
    end
    unless index_exists? ActsAsTaggableOn.taggings_table, :context
      add_index ActsAsTaggableOn.taggings_table, :context
    end

    unless index_exists? ActsAsTaggableOn.taggings_table,
                         %i[tagger_id tagger_type]
      add_index ActsAsTaggableOn.taggings_table, %i[tagger_id tagger_type]
    end

    unless index_exists? ActsAsTaggableOn.taggings_table,
                         %i[taggable_id taggable_type tagger_id context],
                         name: "taggings_idy"
      add_index ActsAsTaggableOn.taggings_table,
                %i[taggable_id taggable_type tagger_id context],
                name: "taggings_idy"
    end
  end
end

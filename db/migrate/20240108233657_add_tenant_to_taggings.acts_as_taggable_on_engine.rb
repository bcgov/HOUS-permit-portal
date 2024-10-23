# frozen_string_literal: true

# This migration comes from acts_as_taggable_on_engine (originally 7)
class AddTenantToTaggings < ActiveRecord::Migration[6.0]
  def self.up
    add_column ActsAsTaggableOn.taggings_table, :tenant, :string, limit: 128
    unless index_exists? ActsAsTaggableOn.taggings_table, :tenant
      add_index ActsAsTaggableOn.taggings_table, :tenant
    end
  end

  def self.down
    remove_index ActsAsTaggableOn.taggings_table, :tenant
    remove_column ActsAsTaggableOn.taggings_table, :tenant
  end
end

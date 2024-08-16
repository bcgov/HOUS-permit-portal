# frozen_string_literal: true

class ReindexRequirementBlocks < ActiveRecord::Migration[7.1]
  def up
    RequirementBlock.reindex
  end

  def down
  end
end

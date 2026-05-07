# frozen_string_literal: true

# Drops the RequirementBlock#visibility column. The enum values
# (any/live) were the residue of the early-access/live template split;
# early access has since been removed, so the column no longer gates
# anything and is safe to retire.
class RemoveVisibilityFromRequirementBlocks < ActiveRecord::Migration[7.2]
  def up
    if column_exists?(:requirement_blocks, :visibility)
      remove_column :requirement_blocks, :visibility
    end
  end

  def down
    add_column :requirement_blocks,
               :visibility,
               :integer,
               default: 0,
               null: false
  end
end

class AddDiscardedAtToRequirementBlocks < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_blocks, :discarded_at, :datetime
    add_index :requirement_blocks, :discarded_at
  end
end

class AddHideInEarlyAccessToRequirementBlocks < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:requirement_blocks, :hide_in_early_access)
      add_column :requirement_blocks,
                 :hide_in_early_access,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:requirement_blocks, :hide_in_early_access)
      remove_column :requirement_blocks, :hide_in_early_access
    end
  end
end

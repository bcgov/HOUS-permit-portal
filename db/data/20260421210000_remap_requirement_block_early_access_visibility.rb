# frozen_string_literal: true

# Remap any remaining requirement_blocks with visibility = "early_access" (enum
# integer 1) to the neutral "any" (enum integer 0) bucket. The "early_access"
# value was removed from the RequirementBlock#visibility enum as part of the
# early-access sweep, so any lingering rows need to be collapsed before the app
# reads them.
class RemapRequirementBlockEarlyAccessVisibility < ActiveRecord::Migration[7.2]
  def up
    return unless table_exists?(:requirement_blocks)
    return unless column_exists?(:requirement_blocks, :visibility)

    # visibility is stored as integer: any=0, early_access=1, live=2
    execute(<<~SQL.squish)
      UPDATE requirement_blocks
         SET visibility = 0
       WHERE visibility = 1
    SQL
  end

  def down
    # No-op: we don't know which rows were originally early_access.
  end
end

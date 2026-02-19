class RenameRollupStatusToStatusInOverheatingTools < ActiveRecord::Migration[
  7.1
]
  def change
    rename_column :overheating_tools, :rollup_status, :status
  end
end

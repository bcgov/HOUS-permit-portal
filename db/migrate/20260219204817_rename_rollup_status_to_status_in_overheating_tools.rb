class RenameRollupStatusToStatusInOverheatingTools < ActiveRecord::Migration[
  7.2
]
  def change
    unless column_exists?(:overheating_tools, :rollup_status)
      rename_column :overheating_tools, :rollup_status, :status
    end
  end
end

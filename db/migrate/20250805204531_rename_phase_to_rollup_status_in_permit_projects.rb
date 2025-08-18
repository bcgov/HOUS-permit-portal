class RenamePhaseToRollupStatusInPermitProjects < ActiveRecord::Migration[7.1]
  def change
    rename_column :permit_projects, :phase, :rollup_status
  end
end

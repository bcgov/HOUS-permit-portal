class RenameStepCodeFields < ActiveRecord::Migration[7.1]
  def change
    if column_exists?(:step_codes, :project_stage)
      rename_column :step_codes, :project_stage, :phase
    end
    if column_exists?(:step_codes, :project_name)
      rename_column :step_codes, :project_name, :title
    end

    if column_exists?(:step_codes, :project_id)
      remove_reference :step_codes,
                       :project,
                       type: :uuid,
                       foreign_key: true,
                       index: true
    end
  end
end

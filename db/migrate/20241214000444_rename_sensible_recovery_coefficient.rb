class RenameSensibleRecoveryCoefficient < ActiveRecord::Migration[7.1]
  def change
    rename_column :part_3_step_code_checklists,
                  :sensible_recovery_efficient,
                  :sensible_recovery_efficiency
  end
end

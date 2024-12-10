class UpdateStepCodeTables < ActiveRecord::Migration[7.1]
  def self.up
    # move step_code reference on step_code_data_entries to step_code_checklist
    add_reference :step_code_data_entries,
                  :checklist,
                  foreign_key: {
                    to_table: :step_code_checklists
                  },
                  index: true,
                  type: :uuid
    execute "UPDATE step_code_data_entries de SET checklist_id = c.id FROM step_code_checklists c WHERE c.step_code_id = de.step_code_id;"
    remove_reference :step_code_data_entries,
                     :step_code,
                     index: true,
                     type: :uuid

    remove_foreign_key :step_code_building_characteristics_summaries,
                       :step_code_checklists
    rename_column :step_code_building_characteristics_summaries,
                  :step_code_checklist_id,
                  :checklist_id
    add_foreign_key :step_code_building_characteristics_summaries,
                    :step_code_checklists,
                    column: :checklist_id

    remove_column :step_code_data_entries, :stage

    rename_table :step_code_checklists, :part_9_step_code_checklists
  end

  def self.down
    # move step_code_checklist reference on step_code_data_entries to step_code
    add_reference :step_code_data_entries, :step_code, index: true, type: :uuid
    execute "UPDATE step_code_data_entries de SET step_code_id = c.step_code_id FROM part_9_step_code_checklists c WHERE c.id = de.checklist_id;"
    remove_reference :step_code_data_entries,
                     :checklist,
                     foreign_key: {
                       to_table: :part_9_step_code_checklists
                     },
                     index: true,
                     type: :uuid

    remove_foreign_key :step_code_building_characteristics_summaries,
                       :part_9_step_code_checklists,
                       column: :checklist_id
    rename_column :step_code_building_characteristics_summaries,
                  :checklist_id,
                  :step_code_checklist_id
    add_foreign_key :step_code_building_characteristics_summaries,
                    :part_9_step_code_checklists,
                    column: :step_code_checklist_id

    add_column :step_code_data_entries, :stage, :integer
    execute "UPDATE step_code_data_entries de SET stage = c.stage FROM part_9_step_code_checklists c WHERE c.step_code_id = de.step_code_id;"

    rename_table :part_9_step_code_checklists, :step_code_checklists
  end
end

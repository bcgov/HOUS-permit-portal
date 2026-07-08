class AddStepCodeStageSupport < ActiveRecord::Migration[7.2]
  def up
    add_column :step_codes,
               :current_stage,
               :string,
               null: false,
               default: "pre_construction"
    execute <<~SQL.squish
      UPDATE step_codes
      SET current_stage = phase
      WHERE phase IN ('pre_construction', 'mid_construction', 'as_built')
    SQL
    add_index :step_codes, :current_stage

    add_column :part_3_step_code_checklists,
               :stage,
               :integer,
               null: false,
               default: 0
    add_column :part_3_step_code_checklists,
               :status,
               :integer,
               null: false,
               default: 0
    add_index :part_3_step_code_checklists, :status
    add_index :part_3_step_code_checklists,
              %i[step_code_id stage],
              unique: true,
              where: "step_code_id IS NOT NULL",
              name: "idx_part_3_checklists_on_step_code_id_and_stage"

    add_index :part_9_step_code_checklists,
              %i[step_code_id stage],
              unique: true,
              where: "step_code_id IS NOT NULL",
              name: "idx_part_9_checklists_on_step_code_id_and_stage"
  end

  def down
    remove_index :part_9_step_code_checklists,
                 name: "idx_part_9_checklists_on_step_code_id_and_stage"
    remove_index :part_3_step_code_checklists,
                 name: "idx_part_3_checklists_on_step_code_id_and_stage"
    remove_index :part_3_step_code_checklists, :status
    remove_column :part_3_step_code_checklists, :status
    remove_column :part_3_step_code_checklists, :stage
    remove_index :step_codes, :current_stage
    remove_column :step_codes, :current_stage
  end
end

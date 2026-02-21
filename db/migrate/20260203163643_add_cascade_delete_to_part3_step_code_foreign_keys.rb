class AddCascadeDeleteToPart3StepCodeForeignKeys < ActiveRecord::Migration[7.1]
  def change
    # Remove and re-add foreign keys with ON DELETE CASCADE for Step Code tables
    # This ensures that when a parent record is deleted (even via raw SQL or database-level cascade),
    # all child records are automatically deleted by the database.

    # ========================================
    # Part 3 Step Code tables
    # ========================================

    # occupancy_classifications -> part_3_step_code_checklists
    remove_foreign_key :occupancy_classifications,
                       :part_3_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :occupancy_classifications,
                    :part_3_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # fuel_types -> part_3_step_code_checklists
    remove_foreign_key :fuel_types,
                       :part_3_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :fuel_types,
                    :part_3_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # make_up_air_fuels -> part_3_step_code_checklists
    remove_foreign_key :make_up_air_fuels,
                       :part_3_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :make_up_air_fuels,
                    :part_3_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # energy_outputs -> part_3_step_code_checklists
    remove_foreign_key :energy_outputs,
                       :part_3_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :energy_outputs,
                    :part_3_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # document_references -> part_3_step_code_checklists
    remove_foreign_key :document_references,
                       :part_3_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :document_references,
                    :part_3_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # part_3_step_code_checklists -> step_codes
    remove_foreign_key :part_3_step_code_checklists, :step_codes
    add_foreign_key :part_3_step_code_checklists,
                    :step_codes,
                    on_delete: :cascade

    # ========================================
    # Part 9 Step Code tables
    # ========================================

    # step_code_building_characteristics_summaries -> part_9_step_code_checklists
    remove_foreign_key :step_code_building_characteristics_summaries,
                       :part_9_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :step_code_building_characteristics_summaries,
                    :part_9_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # step_code_data_entries -> part_9_step_code_checklists
    remove_foreign_key :step_code_data_entries,
                       :part_9_step_code_checklists,
                       column: :checklist_id
    add_foreign_key :step_code_data_entries,
                    :part_9_step_code_checklists,
                    column: :checklist_id,
                    on_delete: :cascade

    # part_9_step_code_checklists -> step_codes
    remove_foreign_key :part_9_step_code_checklists, :step_codes
    add_foreign_key :part_9_step_code_checklists,
                    :step_codes,
                    on_delete: :cascade
  end
end

class RenameAboveGradeWallArea < ActiveRecord::Migration[7.1]
  def change
    rename_column :part_3_step_code_checklists,
                  :above_grade_wall_area,
                  :above_ground_wall_area
  end
end

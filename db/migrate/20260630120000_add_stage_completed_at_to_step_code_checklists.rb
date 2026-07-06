class AddStageCompletedAtToStepCodeChecklists < ActiveRecord::Migration[7.1]
  def up
    add_column :part_9_step_code_checklists, :stage_completed_at, :datetime
    add_column :part_3_step_code_checklists, :stage_completed_at, :datetime

    say_with_time "Backfilling stage_completed_at for completed Part 9 checklists" do
      Part9StepCode::Checklist
        .where(
          status: Part9StepCode::Checklist.statuses[:complete],
          stage_completed_at: nil
        )
        .find_each do |checklist|
          checklist.update_column(:stage_completed_at, checklist.updated_at)
        end
    end

    say_with_time "Backfilling stage_completed_at for completed Part 3 checklists" do
      Part3StepCode::Checklist.find_each do |checklist|
        next unless checklist.complete?
        next if checklist.stage_completed_at.present?

        checklist.update_column(:stage_completed_at, checklist.updated_at)
      end
    end
  end

  def down
    remove_column :part_9_step_code_checklists, :stage_completed_at
    remove_column :part_3_step_code_checklists, :stage_completed_at
  end
end

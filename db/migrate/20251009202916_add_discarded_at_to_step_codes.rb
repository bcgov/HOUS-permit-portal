class AddDiscardedAtToStepCodes < ActiveRecord::Migration[7.2]
  def change
    add_column :step_codes, :discarded_at, :datetime
    add_index :step_codes, :discarded_at
    StepCode.reindex
  end
end

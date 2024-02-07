class CreateStepCodeChecklists < ActiveRecord::Migration[7.1]
  def change
    create_table :step_code_checklists, id: :uuid do |t|
      t.references :step_code, foreign_key: :true, type: :uuid
      t.integer :stage, null: false

      t.timestamps
    end
  end
end

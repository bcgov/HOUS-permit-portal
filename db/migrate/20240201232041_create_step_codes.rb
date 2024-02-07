class CreateStepCodes < ActiveRecord::Migration[7.1]
  def change
    create_table :step_codes, id: :uuid do |t|
      t.timestamps
    end
  end
end

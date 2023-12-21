class CreateWorkTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :work_types, id: :uuid do |t|
      t.string :name
      t.timestamps
    end
  end
end

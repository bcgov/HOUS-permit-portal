class CreatePrimaryTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :primary_types, id: :uuid do |t|
      t.timestamps
    end
  end
end

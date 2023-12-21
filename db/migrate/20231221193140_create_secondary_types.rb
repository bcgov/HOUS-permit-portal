class CreateSecondaryTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :secondary_types, id: :uuid do |t|
      t.references :primary_type, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end
end

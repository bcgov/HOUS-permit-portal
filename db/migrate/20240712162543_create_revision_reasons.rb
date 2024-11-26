class CreateRevisionReasons < ActiveRecord::Migration[7.1]
  def change
    create_table :revision_reasons, id: :uuid do |t|
      t.string :reason_code, limit: 64
      t.string :description
      t.references :site_configuration,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.datetime :discarded_at
      t.timestamps
    end

    add_index :revision_reasons, :reason_code, unique: true
  end
end

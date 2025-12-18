class CreateResources < ActiveRecord::Migration[7.2]
  def change
    create_table :resources, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.string :category, null: false
      t.string :title, null: false
      t.text :description
      t.string :resource_type, null: false
      t.string :link_url

      t.timestamps
    end

    add_index :resources, %i[jurisdiction_id category]
  end
end

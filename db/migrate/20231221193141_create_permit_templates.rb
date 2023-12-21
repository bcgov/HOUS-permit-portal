class CreatePermitTemplates < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_templates, id: :uuid do |t|
      t.string :name
      t.string :description
      t.references :secondary_type, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end
end

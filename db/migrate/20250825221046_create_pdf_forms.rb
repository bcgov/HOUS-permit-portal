class CreatePdfForms < ActiveRecord::Migration[7.1]
  def change
    create_table :pdf_forms, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.jsonb :form_json, default: {}
      t.string :form_type
      t.boolean :status, default: false

      t.timestamps
    end
  end
end

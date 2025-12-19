class CreatePdfForms < ActiveRecord::Migration[7.1]
  def change
    create_table :pdf_forms, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.jsonb :form_json, default: {}
      t.string :form_type
      t.boolean :status, default: false
      # [OVERHEATING REVIEW] Mini-lesson: timestamps consistency.
      # Most tables in this app use `t.timestamps` (created_at + updated_at). This table only has `created_at`,
      # but the frontend/store is treating `createdAt` like “last modified”. Consider adding `updated_at`
      # (or using `t.timestamps`) so “Last modified” is meaningful and consistent.
      t.datetime :created_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
    end
  end
end

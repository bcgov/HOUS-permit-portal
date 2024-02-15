class CreateTemplateVersions < ActiveRecord::Migration[7.1]
  def change
    create_table :template_versions, id: :uuid do |t|
      t.jsonb :denormalized_template_json, default: {}
      t.jsonb :form_json, default: {}
      t.jsonb :requirement_blocks_json, default: {}
      t.json :version_diff, default: {}
      t.date :version_date, null: false
      t.integer :status, default: 0
      t.references :requirement_template,
                   foreign_key: true,
                   type: :uuid,
                   index: true

      t.timestamps
    end
  end
end

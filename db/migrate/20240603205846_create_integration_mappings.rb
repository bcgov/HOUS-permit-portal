class CreateIntegrationMappings < ActiveRecord::Migration[7.1]
  def change
    create_table :integration_mappings, id: :uuid do |t|
      t.jsonb :requirements_mapping, null: false, default: {}
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :template_version,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.timestamps
    end
  end
end

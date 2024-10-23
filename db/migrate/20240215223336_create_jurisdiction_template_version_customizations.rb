class CreateJurisdictionTemplateVersionCustomizations < ActiveRecord::Migration[
  7.1
]
  def change
    create_table :jurisdiction_template_version_customizations, id: :uuid do |t|
      t.jsonb :customizationsa, default: {}
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :template_version,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.timestamps
    end
  end
end

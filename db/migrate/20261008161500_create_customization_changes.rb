class CreateCustomizationChanges < ActiveRecord::Migration[7.2]
  def change
    create_table :customization_changes,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.references :jurisdiction_template_version_customization,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     name: "index_customization_changes_on_jtvc_id"
                   }
      t.jsonb :enabled_components, null: false, default: []
      t.jsonb :disabled_components, null: false, default: []
      t.jsonb :optional_components, null: false, default: []
      t.timestamps
    end

    add_reference :permit_applications,
                  :acknowledged_customization_change,
                  type: :uuid,
                  index: {
                    name: "index_permit_applications_on_acked_change_id"
                  },
                  foreign_key: {
                    to_table: :customization_changes,
                    on_delete: :nullify
                  }
  end
end

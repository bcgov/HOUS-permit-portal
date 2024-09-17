class AddSandboxModeFields < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :sandbox_mode, :boolean, default: false, null: false

    add_column :jurisdiction_template_version_customizations, :sandboxed, :boolean, default: false, null: false

    add_column :permit_applications, :sandboxed, :boolean, default: false, null: false

    add_index :jurisdiction_template_version_customizations,
              %i[jurisdiction_id template_version_id sandboxed],
              unique: true,
              name: "index_jtvcs_on_juris_id_and_template_vers_id_and_sandboxed"
  end
end

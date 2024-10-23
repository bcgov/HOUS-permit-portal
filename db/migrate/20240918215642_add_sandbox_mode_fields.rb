class AddSandboxModeFields < ActiveRecord::Migration[7.1]
  def up
    # Create the sandboxes table with a reference to jurisdictions
    create_table :sandboxes, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.integer :template_version_status_scope, null: false, default: 0
      t.timestamps
    end

    # Add a nullable foreign key reference to sandboxes in jurisdiction_template_version_customizations
    add_reference :jurisdiction_template_version_customizations,
                  :sandbox,
                  null: true,
                  foreign_key: true,
                  type: :uuid

    # Add a nullable foreign key reference to sandboxes in permit_applications
    add_reference :permit_applications,
                  :sandbox,
                  null: true,
                  foreign_key: true,
                  type: :uuid

    # Create a unique index considering null sandbox_id values
    execute <<-SQL
      CREATE UNIQUE INDEX index_jtvcs_unique_on_jurisdiction_template_sandbox
      ON jurisdiction_template_version_customizations (
        jurisdiction_id,
        template_version_id,
        COALESCE(sandbox_id, '00000000-0000-0000-0000-000000000000'::uuid)
      )
    SQL
  end

  def down
    # Drop the unique index
    execute <<-SQL
      DROP INDEX index_jtvcs_unique_on_jurisdiction_template_sandbox
    SQL

    # Remove the sandbox reference from permit_applications
    remove_reference :permit_applications, :sandbox, foreign_key: true

    # Remove the sandbox reference from jurisdiction_template_version_customizations
    remove_reference :jurisdiction_template_version_customizations,
                     :sandbox,
                     foreign_key: true

    # Drop the sandboxes table
    drop_table :sandboxes
  end
end

class AddSandboxModeFields < ActiveRecord::Migration[7.1]
  def change
    # Create the sandboxes table with a reference to jurisdictions
    create_table :sandboxes, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end

    # Add a nullable foreign key reference to sandboxes in jurisdiction_template_version_customizations
    add_reference :jurisdiction_template_version_customizations, :sandbox, null: true, foreign_key: true, type: :uuid

    # Add a nullable foreign key reference to sandboxes in permit_applications
    add_reference :permit_applications, :sandbox, null: true, foreign_key: true, type: :uuid

    # This is a streamlined way of taking null sandbox_id into account when enforcing association uniqueness
    # We do not want multiple of the same jurisdiction_id + template_version_id even when the sandbox_id is null
    execute <<-SQL
                  CREATE UNIQUE INDEX index_jtvcs_unique_on_jurisdiction_template_sandbox
                  ON jurisdiction_template_version_customizations (
                    jurisdiction_id,
                    template_version_id,
                    COALESCE(sandbox_id, '00000000-0000-0000-0000-000000000000'::uuid)
                  )
                SQL
  end
end

class MigrateDataToPermitProjectsAndDropOldColumns < ActiveRecord::Migration[
  7.1
]
  def up
    # Step 1: Seed data from PermitApplication to PermitProject
    # Ensure the seeder service is loaded. If it's in app/services, Rails should autoload it.
    # Might need to explicitly require if run in certain contexts, but usually not for db:migrate.
    PermitProjectSeederService.call

    # Step 2: Drop old columns
    # From permit_applications
    if column_exists?(:permit_applications, :jurisdiction_id)
      # Check if this is the *old* direct jurisdiction_id, not one related to property_plan_jurisdiction if that was also named jurisdiction_id
      # Assuming this is the one we want to drop, that was for PA's direct jurisdiction
      # We might need to be more specific if there's ambiguity with other jurisdiction references.
      # For now, proceeding with simple removal if it exists.
      remove_column :permit_applications, :jurisdiction_id, :uuid # remove_reference might fail if FK constraint name is unknown or already gone
    end
    if column_exists?(:permit_applications, :nickname)
      remove_column :permit_applications, :nickname, :string
    end
    if column_exists?(:permit_applications, :full_address)
      remove_column :permit_applications, :full_address, :text
    end
    if column_exists?(:permit_applications, :pid)
      remove_column :permit_applications, :pid, :string
    end
    if column_exists?(:permit_applications, :pin)
      remove_column :permit_applications, :pin, :string
    end

    # From step_codes
    if column_exists?(:step_codes, :project_name)
      remove_column :step_codes, :project_name, :string
    end
    if column_exists?(:step_codes, :project_address)
      remove_column :step_codes, :project_address, :string
    end
    if column_exists?(:step_codes, :jurisdiction_name)
      remove_column :step_codes, :jurisdiction_name, :string
    end
    if column_exists?(:step_codes, :project_identifier)
      remove_column :step_codes, :project_identifier, :string
    end
    if column_exists?(:step_codes, :permit_date)
      remove_column :step_codes, :permit_date, :date
    end
    # Polymorphic parent columns from step_codes (if they exist)
    if column_exists?(:step_codes, :parent_id)
      remove_column :step_codes, :parent_id, :uuid
    end
    if column_exists?(:step_codes, :parent_type)
      remove_column :step_codes, :parent_type, :string
    end
    # Also remove index if it exists for polymorphic parent
    if index_exists?(:step_codes, %i[parent_type parent_id])
      remove_index :step_codes, %i[parent_type parent_id]
    end
  end

  def down
    # Add columns back
    # To permit_applications
    unless column_exists?(:permit_applications, :jurisdiction_id)
      # This was the PA's direct jurisdiction_id
      add_column :permit_applications, :jurisdiction_id, :uuid
      # add_reference :permit_applications, :jurisdiction, foreign_key: true, type: :uuid, null: true # This was the original, but if it was just a simple column, add_column is fine.
    end
    unless column_exists?(:permit_applications, :nickname)
      add_column :permit_applications, :nickname, :string
    end
    unless column_exists?(:permit_applications, :full_address)
      add_column :permit_applications, :full_address, :text
    end
    unless column_exists?(:permit_applications, :pid)
      add_column :permit_applications, :pid, :string
    end
    unless column_exists?(:permit_applications, :pin)
      add_column :permit_applications, :pin, :string
    end

    # To step_codes
    unless column_exists?(:step_codes, :project_name)
      add_column :step_codes, :project_name, :string
    end
    unless column_exists?(:step_codes, :project_address)
      add_column :step_codes, :project_address, :string
    end
    unless column_exists?(:step_codes, :jurisdiction_name)
      add_column :step_codes, :jurisdiction_name, :string
    end
    unless column_exists?(:step_codes, :project_identifier)
      add_column :step_codes, :project_identifier, :string
    end
    unless column_exists?(:step_codes, :permit_date)
      add_column :step_codes, :permit_date, :date
    end
    # Polymorphic parent columns for step_codes
    unless column_exists?(:step_codes, :parent_type)
      add_column :step_codes, :parent_type, :string
    end
    unless column_exists?(:step_codes, :parent_id)
      add_column :step_codes, :parent_id, :uuid
    end
    unless index_exists?(:step_codes, %i[parent_type parent_id])
      add_index :step_codes, %i[parent_type parent_id]
    end

    # Note: Reversing the data seeding from PermitProject back to PermitApplication
    # is complex and typically not fully implemented in a 'down' migration.
    # The primary goal of 'down' is to restore schema for code compatibility.
    Rails.logger.info "Old columns re-added. Data from PermitProjects would need to be manually migrated back if required."
  end
end

class ChangeStepCodeToPolymorphicParent < ActiveRecord::Migration[7.1]
  def up
    # Add parent_type and parent_id columns first
    unless column_exists?(:step_codes, :parent_type)
      add_column :step_codes, :parent_type, :string
    end
    unless column_exists?(:step_codes, :parent_id)
      add_column :step_codes, :parent_id, :uuid
    end

    # Data migration: populate parent_type and parent_id from existing permit_application_id
    # This assumes a model named StepCode exists and can be queried.
    # If running this migration in a context where the model isn't directly available,
    # a simple SQL update would be more robust, e.g.:
    # execute "UPDATE step_codes SET parent_type = 'PermitApplication', parent_id = permit_application_id WHERE permit_application_id IS NOT NULL"
    if column_exists?(:step_codes, :permit_application_id)
      StepCode
        .where.not(permit_application_id: nil)
        .find_each do |sc|
          sc.update_columns(
            parent_type: "PermitApplication",
            parent_id: sc.permit_application_id
          )
        end
    end

    # Add index for the new polymorphic association
    unless index_exists?(:step_codes, %i[parent_type parent_id])
      add_index :step_codes, %i[parent_type parent_id]
    end

    # Remove the old permit_application_id column if it exists
    if column_exists?(:step_codes, :permit_application_id)
      remove_column :step_codes, :permit_application_id, :uuid
    end
  end

  def down
    # Add back the permit_application_id column
    unless column_exists?(:step_codes, :permit_application_id)
      add_column :step_codes, :permit_application_id, :uuid
    end

    # Data migration: populate permit_application_id from parent_id where parent_type is 'PermitApplication'
    # Similar to above, direct SQL might be more robust in some migration contexts:
    # execute "UPDATE step_codes SET permit_application_id = parent_id WHERE parent_type = 'PermitApplication'"
    StepCode
      .where(parent_type: "PermitApplication")
      .find_each { |sc| sc.update_columns(permit_application_id: sc.parent_id) }

    # Remove the polymorphic association columns and index
    if index_exists?(:step_codes, %i[parent_type parent_id])
      remove_index :step_codes, %i[parent_type parent_id]
    end
    if column_exists?(:step_codes, :parent_id)
      remove_column :step_codes, :parent_id, :uuid
    end
    if column_exists?(:step_codes, :parent_type)
      remove_column :step_codes, :parent_type, :string
    end
  end
end

class RenameProjectNumberToNumberInPermitProjects < ActiveRecord::Migration[7.1]
  def up
    # Rename the column if needed
    if column_exists?(:permit_projects, :project_number) &&
         !column_exists?(:permit_projects, :number)
      rename_column :permit_projects, :project_number, :number
    end

    # Ensure a unique index on the new column
    unless index_exists?(:permit_projects, :number)
      add_index :permit_projects, :number, unique: true
    end

    # Drop any legacy index on the old column name
    if index_exists?(:permit_projects, :project_number)
      remove_index :permit_projects, :project_number
    end
    PermitProject.find_each(&:save)
    PermitApplication.reindex
    StepCode.reindex
  end

  def down
    # Remove index on :number before renaming back
    if index_exists?(:permit_projects, :number)
      remove_index :permit_projects, :number
    end

    if column_exists?(:permit_projects, :number) &&
         !column_exists?(:permit_projects, :project_number)
      rename_column :permit_projects, :number, :project_number
    end

    # Restore unique index on the old column if it exists
    unless index_exists?(:permit_projects, :project_number)
      add_index :permit_projects, :project_number, unique: true
    end
  end
end

class AddIsPrimaryToPermitProjectPermitApplications < ActiveRecord::Migration[
  7.1
]
  def change
    add_column :permit_project_permit_applications,
               :is_primary,
               :boolean,
               default: false,
               null: false

    # This index ensures that a permit_project can only have one record
    # in permit_project_permit_applications where is_primary is true.
    add_index :permit_project_permit_applications,
              %i[permit_project_id is_primary],
              unique: true,
              where: "is_primary = true",
              name: "index_unique_primary_application_for_project"
  end
end

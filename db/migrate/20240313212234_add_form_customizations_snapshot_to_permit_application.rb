class AddFormCustomizationsSnapshotToPermitApplication < ActiveRecord::Migration[
  7.1
]
  def change
    add_column :permit_applications,
               :form_customizations_snapshot,
               :jsonb,
               null: true
  end
end

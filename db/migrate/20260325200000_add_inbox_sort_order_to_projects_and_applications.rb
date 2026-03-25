class AddInboxSortOrderToProjectsAndApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :inbox_sort_order, :integer
    add_column :permit_applications, :inbox_sort_order, :integer
  end
end

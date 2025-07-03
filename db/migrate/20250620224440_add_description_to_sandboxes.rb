class AddDescriptionToSandboxes < ActiveRecord::Migration[7.1]
  def change
    add_column :sandboxes, :description, :text
  end
end

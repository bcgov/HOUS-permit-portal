class AddDescriptionToSandboxes < ActiveRecord::Migration[7.1]
  def up
    unless column_exists?(:sandboxes, :description)
      add_column :sandboxes, :description, :text
    end
  end

  def down
    if column_exists?(:sandboxes, :description)
      remove_column :sandboxes, :description
    end
  end
end

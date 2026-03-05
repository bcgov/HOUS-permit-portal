class RemoveNameAndDescriptionFromSandboxes < ActiveRecord::Migration[7.1]
  def up
    remove_column :sandboxes, :name, :string
    remove_column :sandboxes, :description, :text
    add_index :sandboxes,
              %i[jurisdiction_id template_version_status_scope],
              unique: true,
              name: "index_sandboxes_on_jurisdiction_and_scope"
  end

  def down
    remove_index :sandboxes, name: "index_sandboxes_on_jurisdiction_and_scope"

    add_column :sandboxes, :name, :string
    add_column :sandboxes, :description, :text

    Sandbox.reset_column_information
    Sandbox.find_each do |sandbox|
      sandbox.update_columns(
        name: sandbox.template_version_status_scope.capitalize,
        description: nil
      )
    end

    change_column_null :sandboxes, :name, false
  end
end

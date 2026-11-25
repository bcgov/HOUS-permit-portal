class AddAboutPageDisplayToResources < ActiveRecord::Migration[7.2]
  def up
    add_column :resources, :show_on_about, :boolean, null: false, default: true
    add_column :resources, :about_position, :integer
    add_index :resources,
              %i[jurisdiction_id about_position],
              name: "index_resources_on_jurisdiction_id_and_about_position"

    execute <<~SQL
      UPDATE resources
      SET about_position = numbered.position
      FROM (
        SELECT id,
               (ROW_NUMBER() OVER (PARTITION BY jurisdiction_id ORDER BY created_at ASC) - 1) AS position
        FROM resources
      ) numbered
      WHERE resources.id = numbered.id
    SQL
  end

  def down
    remove_index :resources,
                 name: "index_resources_on_jurisdiction_id_and_about_position"
    remove_column :resources, :about_position
    remove_column :resources, :show_on_about
  end
end

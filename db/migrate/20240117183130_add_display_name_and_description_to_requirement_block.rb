class AddDisplayNameAndDescriptionToRequirementBlock < ActiveRecord::Migration[
  7.1
]
  def change
    add_column :requirement_blocks, :display_name, :string
    add_column :requirement_blocks, :display_description, :string, null: true

    RequirementBlock.update_all("display_name = name")

    change_column_null :requirement_blocks, :display_name, false
  end
end

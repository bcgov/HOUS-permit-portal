class ChangeBlockNameUniquenessScope < ActiveRecord::Migration[7.1]
  def change
    remove_index "requirement_blocks", name: "index_requirement_blocks_on_name"
    add_index :requirement_blocks,
              %i[name first_nations],
              unique: true,
              name: "index_requirement_blocks_on_name_and_first_nations"
  end
end

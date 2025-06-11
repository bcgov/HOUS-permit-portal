class MakeRequirementBlockNameUniqueOnlyWhenNotDiscarded < ActiveRecord::Migration[
  6.0
]
  def change
    remove_index :requirement_blocks,
                 name: "index_requirement_blocks_on_name_and_first_nations"
    add_index :requirement_blocks,
              %i[name first_nations],
              unique: true,
              where: "discarded_at IS NULL",
              name: "index_requirement_blocks_on_name_and_first_nations"
  end
end

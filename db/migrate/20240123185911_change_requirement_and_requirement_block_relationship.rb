class ChangeRequirementAndRequirementBlockRelationship < ActiveRecord::Migration[7.1]
  def change
    # removes all references from join table
    execute("DELETE FROM requirement_block_requirements")
    Requirement.destroy_all
    RequirementBlock.destroy_all

    # add requirement block reference to requirement to make it a 1 to many relationship
    add_reference :requirements, :requirement_block, null: false, foreign_key: true, type: :uuid

    # remove join table to remove many to many relationship
    drop_table :requirement_block_requirements
  end
end

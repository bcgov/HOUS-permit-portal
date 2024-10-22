class CreateRequirementBlockRequirements < ActiveRecord::Migration[7.1]
  def change
    create_table :requirement_block_requirements, id: :uuid do |t|
      t.references :requirement, null: false, foreign_key: true, type: :uuid
      t.references :requirement_block,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.integer :position

      t.timestamps
    end
  end
end

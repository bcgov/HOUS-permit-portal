class CreateRequirementBlocks < ActiveRecord::Migration[7.1]
  def change
    create_table :requirement_blocks, id: :uuid do |t|
      t.string :name, null: false
      t.integer :sign_off_role, null: false, default: 0
      t.integer :reviewer_role, null: false, default: 0
      t.jsonb :custom_validations, null: false, default: {}

      t.timestamps
    end

    add_index :requirement_blocks, :name, unique: true
  end
end

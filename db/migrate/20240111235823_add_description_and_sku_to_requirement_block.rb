class AddDescriptionAndSkuToRequirementBlock < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_blocks, :description, :string
    add_column :requirement_blocks, :sku, :string

    add_index :requirement_blocks, :sku, unique: true
  end
end

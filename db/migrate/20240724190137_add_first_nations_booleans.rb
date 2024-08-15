class AddFirstNationsBooleans < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_templates, :first_nations, :boolean, default: false
    add_column :requirement_blocks, :first_nations, :boolean, default: false
  end
end

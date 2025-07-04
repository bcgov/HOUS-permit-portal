class AddInstructionsToRequirements < ActiveRecord::Migration[7.1]
  def change
    add_column :requirements, :instructions, :text
  end
end

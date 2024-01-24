class AddPositionToRequirement < ActiveRecord::Migration[7.1]
  def change
    add_column :requirements, :position, :integer
  end
end

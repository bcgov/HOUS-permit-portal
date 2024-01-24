class RemoveReusableFromRequirement < ActiveRecord::Migration[7.1]
  def change
    remove_column :requirements, :reusable
  end
end

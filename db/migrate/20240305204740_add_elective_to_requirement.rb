class AddElectiveToRequirement < ActiveRecord::Migration[7.1]
  def change
    add_column :requirements, :elective, :boolean, default: false
  end
end

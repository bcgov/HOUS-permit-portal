class AddPublicToRequirementTemplate < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_templates, :public, :boolean, default: false
  end
end

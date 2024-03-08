class RemoveUnusedFieldsFromRequirementTemplate < ActiveRecord::Migration[7.1]
  def change
    remove_column :requirement_templates, :version
    remove_column :requirement_templates, :scheduled_for
    remove_column :requirement_templates, :status
  end
end

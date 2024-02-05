class AddDiscardedAtToRequirementTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_templates, :discarded_at, :datetime
    add_index :requirement_templates, :discarded_at
  end
end

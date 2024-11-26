class RemoveTemplateClassificationUniquenessIndex < ActiveRecord::Migration[7.1]
  def change
    remove_index :requirement_templates,
                 column: %i[permit_type_id activity_id],
                 unique: true
  end
end

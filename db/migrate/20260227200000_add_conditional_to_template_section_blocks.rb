class AddConditionalToTemplateSectionBlocks < ActiveRecord::Migration[7.1]
  def change
    add_column :template_section_blocks, :conditional, :jsonb, default: nil
  end
end

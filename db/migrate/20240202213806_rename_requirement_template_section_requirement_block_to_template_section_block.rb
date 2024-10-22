class RenameRequirementTemplateSectionRequirementBlockToTemplateSectionBlock < ActiveRecord::Migration[
  7.1
]
  def change
    rename_table :requirement_template_section_requirement_blocks,
                 :template_section_blocks
  end
end

class CreateRequirementTemplateSectionRequirementBlocks < ActiveRecord::Migration[
  7.1
]
  def change
    create_table :requirement_template_section_requirement_blocks,
                 id: :uuid do |t|
      t.references :requirement_template_section,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.references :requirement_block,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.integer :position

      t.timestamps
    end
  end
end

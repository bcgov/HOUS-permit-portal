class CreateRequirementTemplateSections < ActiveRecord::Migration[7.1]
  def change
    create_table :requirement_template_sections, id: :uuid do |t|
      t.string :name
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.integer :position

      t.timestamps
    end
  end
end

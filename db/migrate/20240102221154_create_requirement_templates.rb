class CreateRequirementTemplates < ActiveRecord::Migration[7.1]
  def change
    create_table :requirement_templates, id: :uuid do |t|
      t.references :activity,
                   null: false,
                   foreign_key: {
                     to_table: :permit_classifications
                   },
                   type: :uuid
      t.references :permit_type,
                   null: false,
                   foreign_key: {
                     to_table: :permit_classifications
                   },
                   type: :uuid

      t.timestamps
    end

    add_index :requirement_templates,
              %i[permit_type_id activity_id],
              unique: true
  end
end

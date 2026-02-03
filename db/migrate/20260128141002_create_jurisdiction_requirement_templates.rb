class CreateJurisdictionRequirementTemplates < ActiveRecord::Migration[7.2]
  def change
    create_table :jurisdiction_requirement_templates, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      add_column :requirement_templates, :available_globally, :boolean
      t.timestamps
    end

    add_index :jurisdiction_requirement_templates,
              %i[jurisdiction_id requirement_template_id],
              unique: true,
              name: "index_jrt_on_jurisdiction_and_template"
  end
end

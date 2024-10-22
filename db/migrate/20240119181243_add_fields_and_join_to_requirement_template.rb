class AddFieldsAndJoinToRequirementTemplate < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_templates, :status, :integer, default: 0
    add_column :requirement_templates, :description, :string
    add_column :requirement_templates, :version, :string
    add_column :requirement_templates, :scheduled_for, :date

    create_table :jurisdiction_requirement_templates do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.timestamps
    end
  end
end

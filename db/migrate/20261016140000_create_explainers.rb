class CreateExplainers < ActiveRecord::Migration[7.2]
  def change
    create_table :explainers, id: :uuid do |t|
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     unique: true
                   }
      t.text :introduction_html, null: false, default: ""
      t.text :before_you_apply_html, null: false, default: ""
      t.jsonb :steps, null: false, default: []
      t.jsonb :links, null: false, default: []
      t.datetime :published_at

      t.timestamps
    end

    create_table :explainer_documents, id: :uuid do |t|
      t.references :explainer, null: false, foreign_key: true, type: :uuid
      t.jsonb :file_data
      t.string :scan_status, null: false, default: "pending"

      t.timestamps
    end

    add_index :explainer_documents, :scan_status

    create_table :explainer_related_templates, id: :uuid do |t|
      t.references :explainer, null: false, foreign_key: true, type: :uuid
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :explainer_related_templates,
              %i[explainer_id requirement_template_id],
              unique: true,
              name: "idx_on_explainer_and_related_template"
  end
end

class CreateJurisdictionExplainers < ActiveRecord::Migration[7.2]
  def change
    create_table :jurisdiction_explainers, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.text :local_context_html, null: false, default: ""

      t.timestamps
      t.index %i[jurisdiction_id requirement_template_id],
              unique: true,
              name: "idx_jurisdiction_explainers_on_jurisdiction_and_template"
    end
  end
end

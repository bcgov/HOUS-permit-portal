# frozen_string_literal: true

class CreateTemplateCategories < ActiveRecord::Migration[7.2]
  def change
    create_table :template_categories,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.string :label, null: false
      t.integer :sort_order, null: false, default: 0

      t.timestamps
    end

    add_index :template_categories, :sort_order
    add_index :template_categories,
              "LOWER(label)",
              unique: true,
              name: "index_template_categories_on_lower_label"

    add_reference :requirement_templates,
                  :template_category,
                  type: :uuid,
                  null: true,
                  foreign_key: true
    add_column :requirement_templates,
               :sort_order,
               :integer,
               null: false,
               default: 0
    add_index :requirement_templates,
              %i[template_category_id sort_order],
              name: "index_requirement_templates_on_category_and_sort_order"
  end
end

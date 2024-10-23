class CreateEarlyAccessPreviewFields < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_templates, :type, :string
    add_column :requirement_templates, :nickname, :string
    add_column :requirement_templates, :fetched_at, :datetime

    add_column :requirement_blocks,
               :visibility,
               :integer,
               null: false,
               default: 0

    add_reference :requirement_templates,
                  :copied_from,
                  null: true,
                  foreign_key: {
                    to_table: :requirement_templates
                  },
                  type: :uuid

    add_reference :requirement_templates,
                  :assignee,
                  null: true,
                  foreign_key: {
                    to_table: :users
                  },
                  type: :uuid

    add_reference :requirement_template_sections,
                  :copied_from,
                  null: true,
                  foreign_key: {
                    to_table: :requirement_template_sections
                  },
                  type: :uuid

    add_index :requirement_templates, :type
  end
end

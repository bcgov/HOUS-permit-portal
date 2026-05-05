# frozen_string_literal: true

class RemovePermitClassificationSystem < ActiveRecord::Migration[7.2]
  def up
    # 1. Create submission_contacts table (replaces permit_type_submission_contacts)
    create_table :submission_contacts,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.references :jurisdiction, type: :uuid, null: false, foreign_key: true
      t.string :email, null: false
      t.string :title
      t.string :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.boolean :default, default: false, null: false
      t.timestamps
    end
    add_index :submission_contacts, %i[jurisdiction_id email], unique: true

    # 2. Add submission_contact_id to jurisdiction_template_version_customizations
    add_reference :jurisdiction_template_version_customizations,
                  :submission_contact,
                  type: :uuid,
                  null: true,
                  foreign_key: true

    # 3. Migrate existing permit_type_submission_contacts data to submission_contacts
    execute <<-SQL
      INSERT INTO submission_contacts (id, jurisdiction_id, email, title, confirmation_token, confirmed_at, confirmation_sent_at, "default", created_at, updated_at)
      SELECT
        gen_random_uuid(),
        ptsc.jurisdiction_id,
        ptsc.email,
        NULL,
        ptsc.confirmation_token,
        ptsc.confirmed_at,
        ptsc.confirmation_sent_at,
        FALSE,
        NOW(),
        NOW()
      FROM permit_type_submission_contacts ptsc
      ON CONFLICT (jurisdiction_id, email) DO NOTHING
    SQL

    # Mark first contact per jurisdiction as default
    execute <<-SQL
      UPDATE submission_contacts
      SET "default" = TRUE
      WHERE id IN (
        SELECT DISTINCT ON (jurisdiction_id) id
        FROM submission_contacts
        ORDER BY jurisdiction_id, confirmed_at DESC NULLS LAST, created_at ASC
      )
    SQL

    # 4. Convert permit classifications + first_nations into tags on requirement_templates
    execute <<-SQL
      INSERT INTO tags (id, name, created_at, updated_at, taggings_count)
      SELECT gen_random_uuid(), pc.name, NOW(), NOW(), 0
      FROM permit_classifications pc
      WHERE NOT EXISTS (SELECT 1 FROM tags WHERE tags.name = pc.name)
    SQL

    # Insert category tags
    execute <<-SQL
      INSERT INTO tags (id, name, created_at, updated_at, taggings_count)
      SELECT gen_random_uuid(), INITCAP(REPLACE(pc.category, '_', ' ')), NOW(), NOW(), 0
      FROM permit_classifications pc
      WHERE pc.category IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM tags WHERE tags.name = INITCAP(REPLACE(pc.category, '_', ' ')))
      GROUP BY pc.category
    SQL

    # Insert "First Nations" tag if not exists
    execute <<-SQL
      INSERT INTO tags (id, name, created_at, updated_at, taggings_count)
      SELECT gen_random_uuid(), 'First Nations', NOW(), NOW(), 0
      WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'First Nations')
    SQL

    # Tag requirement_templates with their permit_type name
    execute <<-SQL
      INSERT INTO taggings (id, tag_id, taggable_type, taggable_id, context, created_at)
      SELECT gen_random_uuid(), t.id, 'RequirementTemplate', rt.id, 'tags', NOW()
      FROM requirement_templates rt
      JOIN permit_classifications pc ON pc.id = rt.permit_type_id
      JOIN tags t ON t.name = pc.name
      ON CONFLICT DO NOTHING
    SQL

    # Tag requirement_templates with their activity name
    execute <<-SQL
      INSERT INTO taggings (id, tag_id, taggable_type, taggable_id, context, created_at)
      SELECT gen_random_uuid(), t.id, 'RequirementTemplate', rt.id, 'tags', NOW()
      FROM requirement_templates rt
      JOIN permit_classifications pc ON pc.id = rt.activity_id
      JOIN tags t ON t.name = pc.name
      ON CONFLICT DO NOTHING
    SQL

    # Tag requirement_templates with their activity category
    execute <<-SQL
      INSERT INTO taggings (id, tag_id, taggable_type, taggable_id, context, created_at)
      SELECT gen_random_uuid(), t.id, 'RequirementTemplate', rt.id, 'tags', NOW()
      FROM requirement_templates rt
      JOIN permit_classifications pc ON pc.id = rt.activity_id
      JOIN tags t ON t.name = INITCAP(REPLACE(pc.category, '_', ' '))
      WHERE pc.category IS NOT NULL
      ON CONFLICT DO NOTHING
    SQL

    # Tag first_nations requirement_templates
    execute <<-SQL
      INSERT INTO taggings (id, tag_id, taggable_type, taggable_id, context, created_at)
      SELECT gen_random_uuid(), t.id, 'RequirementTemplate', rt.id, 'tags', NOW()
      FROM requirement_templates rt
      CROSS JOIN tags t
      WHERE rt.first_nations = TRUE AND t.name = 'First Nations'
      ON CONFLICT DO NOTHING
    SQL

    # Tag first_nations requirement_blocks
    execute <<-SQL
      INSERT INTO taggings (id, tag_id, taggable_type, taggable_id, context, created_at)
      SELECT gen_random_uuid(), t.id, 'RequirementBlock', rb.id, 'tags', NOW()
      FROM requirement_blocks rb
      CROSS JOIN tags t
      WHERE rb.first_nations = TRUE AND t.name = 'First Nations'
      ON CONFLICT DO NOTHING
    SQL

    # Update taggings_count on tags
    execute <<-SQL
      UPDATE tags SET taggings_count = (
        SELECT COUNT(*) FROM taggings WHERE taggings.tag_id = tags.id
      )
    SQL

    # 5. Remove foreign keys first
    remove_foreign_key :requirement_templates, column: :activity_id
    remove_foreign_key :requirement_templates, column: :permit_type_id
    remove_foreign_key :permit_applications, column: :activity_id
    remove_foreign_key :permit_applications, column: :permit_type_id
    remove_foreign_key :permit_type_required_steps, column: :permit_type_id
    remove_foreign_key :permit_type_submission_contacts, column: :permit_type_id
    remove_foreign_key :pre_checks, column: :permit_type_id

    # 6. Remove columns
    remove_column :requirement_templates, :activity_id
    remove_column :requirement_templates, :permit_type_id
    remove_column :requirement_templates, :first_nations

    remove_column :permit_applications, :activity_id
    remove_column :permit_applications, :permit_type_id
    remove_column :permit_applications, :first_nations

    # Replace the unique index that included first_nations before dropping the column
    remove_index :requirement_blocks,
                 name: :index_requirement_blocks_on_name_and_first_nations
    remove_column :requirement_blocks, :first_nations
    add_index :requirement_blocks,
              :name,
              unique: true,
              where: "discarded_at IS NULL",
              name: :index_requirement_blocks_on_name

    remove_column :pre_checks, :permit_type_id

    # 7. Rename permit_type_required_steps -> jurisdiction_step_requirements
    remove_column :permit_type_required_steps, :permit_type_id
    rename_table :permit_type_required_steps, :jurisdiction_step_requirements

    # 8. Drop old tables
    drop_table :permit_type_submission_contacts
    drop_table :permit_classifications
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

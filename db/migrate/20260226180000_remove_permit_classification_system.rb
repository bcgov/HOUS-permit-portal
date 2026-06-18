# frozen_string_literal: true

class RemovePermitClassificationSystem < ActiveRecord::Migration[7.2]
  def up
    migrate_early_access_to_drafts_before_legacy_columns_drop

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

  private

  def migrate_early_access_to_drafts_before_legacy_columns_drop
    unless early_access_prerequisites_met?
      say "Skipping early access conversion: schema prerequisites not present."
      return
    end

    migrate_ea_templates_to_drafts
    retire_early_access_requirement_templates
    cleanup_early_access_legacy_columns
  end

  def early_access_prerequisites_met?
    table_exists?(:template_version_previews) &&
      column_exists?(
        :template_version_previews,
        :early_access_requirement_template_id
      ) && column_exists?(:requirement_templates, :assignee_id) &&
      column_exists?(:requirement_templates, :public) &&
      column_exists?(:requirement_templates, :site_configuration_id) &&
      column_exists?(:requirement_templates, :type) &&
      column_exists?(:requirement_templates, :permit_type_id) &&
      column_exists?(:requirement_templates, :activity_id) &&
      column_exists?(:requirement_templates, :first_nations)
  end

  def migrate_ea_templates_to_drafts
    ea_templates = execute_sql(<<~SQL)
      SELECT rt.id, rt.permit_type_id, rt.activity_id, rt.first_nations,
             rt.assignee_id, rt.public, rt.site_configuration_id,
             rt.discarded_at
      FROM requirement_templates rt
      WHERE rt.type = 'EarlyAccessRequirementTemplate'
    SQL

    ea_templates.each { |ea| process_ea_template(ea) }
    report_unlinked_previews
  end

  def process_ea_template(ea)
    ea_discarded = !ea["discarded_at"].nil?

    live_template_id =
      find_or_create_live_template_id(ea, allow_create: !ea_discarded)
    return if live_template_id.nil?

    draft_id =
      find_or_create_draft_id(live_template_id, ea, allow_create: !ea_discarded)
    return if draft_id.nil?

    relink_previews_for_ea(ea["id"], draft_id)
  end

  def find_or_create_live_template_id(ea, allow_create:)
    existing = execute_sql(<<~SQL).first
      SELECT id FROM requirement_templates
      WHERE type = 'LiveRequirementTemplate'
        AND permit_type_id = '#{ea["permit_type_id"]}'
        AND activity_id = '#{ea["activity_id"]}'
        AND first_nations = #{ea["first_nations"]}
        AND discarded_at IS NULL
      LIMIT 1
    SQL
    return existing["id"] if existing.present?
    return nil unless allow_create

    execute(<<~SQL)
      INSERT INTO requirement_templates (
        id, permit_type_id, activity_id, first_nations, type, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        '#{ea["permit_type_id"]}',
        '#{ea["activity_id"]}',
        #{ea["first_nations"]},
        'LiveRequirementTemplate',
        NOW(),
        NOW()
      )
    SQL

    created = execute_sql(<<~SQL).first
      SELECT id FROM requirement_templates
      WHERE type = 'LiveRequirementTemplate'
        AND permit_type_id = '#{ea["permit_type_id"]}'
        AND activity_id = '#{ea["activity_id"]}'
        AND first_nations = #{ea["first_nations"]}
        AND discarded_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    SQL
    created&.dig("id")
  end

  def find_or_create_draft_id(live_template_id, ea, allow_create:)
    existing_draft = execute_sql(<<~SQL).first
      SELECT id FROM template_versions
      WHERE requirement_template_id = '#{live_template_id}'
        AND status = 3
      ORDER BY created_at DESC
      LIMIT 1
    SQL
    return existing_draft["id"] if existing_draft.present?
    return nil unless allow_create

    ea_published = execute_sql(<<~SQL).first
      SELECT denormalized_template_json, form_json, requirement_blocks_json, version_date
      FROM template_versions
      WHERE requirement_template_id = '#{ea["id"]}'
        AND status = 1
      ORDER BY version_date DESC
      LIMIT 1
    SQL
    return nil if ea_published.nil?

    execute(<<~SQL)
      INSERT INTO template_versions (
        id, requirement_template_id, status,
        denormalized_template_json, form_json, requirement_blocks_json,
        version_date, version_diff,
        assignee_id, publicly_previewable, site_configuration_id,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        '#{live_template_id}',
        3,
        '#{escape_json(ea_published["denormalized_template_json"])}',
        '#{escape_json(ea_published["form_json"])}',
        '#{escape_json(ea_published["requirement_blocks_json"])}',
        '#{ea_published["version_date"]}',
        '{}',
        #{ea["assignee_id"] ? "'#{ea["assignee_id"]}'" : "NULL"},
        #{boolean_sql(ea["public"])},
        #{ea["site_configuration_id"] ? "'#{ea["site_configuration_id"]}'" : "NULL"},
        NOW(),
        NOW()
      )
    SQL

    created = execute_sql(<<~SQL).first
      SELECT id FROM template_versions
      WHERE requirement_template_id = '#{live_template_id}'
        AND status = 3
      ORDER BY created_at DESC
      LIMIT 1
    SQL
    created&.dig("id")
  end

  def relink_previews_for_ea(ea_id, draft_id)
    execute(<<~SQL)
      UPDATE template_version_previews
      SET template_version_id = '#{draft_id}',
          updated_at = NOW()
      WHERE early_access_requirement_template_id = '#{ea_id}'
        AND template_version_id IS NULL
    SQL
  end

  def report_unlinked_previews
    remaining = execute_sql(<<~SQL).first["cnt"].to_i
      SELECT COUNT(*) AS cnt
      FROM template_version_previews
      WHERE template_version_id IS NULL
    SQL

    return if remaining.zero?

    say "#{remaining} template_version_previews still have NULL template_version_id after early access conversion; cleanup will delete them."
  end

  def retire_early_access_requirement_templates
    result = execute(<<~SQL)
      UPDATE requirement_templates
      SET discarded_at = NOW(), updated_at = NOW()
      WHERE type = 'EarlyAccessRequirementTemplate'
        AND discarded_at IS NULL
      RETURNING id
    SQL

    say "Discarded #{result.cmd_tuples} early access requirement_templates."
  end

  def cleanup_early_access_legacy_columns
    clear_ea_inherited_live_template_metadata

    orphan_count =
      execute(
        "DELETE FROM template_version_previews WHERE template_version_id IS NULL"
      ).cmd_tuples
    if orphan_count.positive?
      say "Deleted #{orphan_count} orphaned template_version_previews."
    end

    remove_index :template_version_previews,
                 name:
                   "index_early_access_previews_on_template_id_and_previewer_id",
                 if_exists: true
    remove_column :template_version_previews,
                  :early_access_requirement_template_id,
                  if_exists: true
    change_column_null :template_version_previews, :template_version_id, false

    remove_column :requirement_templates, :assignee_id, :uuid, if_exists: true
    remove_column :requirement_templates, :public, :boolean, if_exists: true
    remove_column :requirement_templates,
                  :site_configuration_id,
                  :uuid,
                  if_exists: true
  end

  def clear_ea_inherited_live_template_metadata
    cleared = execute(<<~SQL).cmd_tuples
      UPDATE requirement_templates AS live
      SET description = NULL,
          nickname = NULL,
          updated_at = NOW()
      FROM requirement_templates AS ea
      WHERE live.type = 'LiveRequirementTemplate'
        AND ea.type = 'EarlyAccessRequirementTemplate'
        AND live.permit_type_id = ea.permit_type_id
        AND live.activity_id = ea.activity_id
        AND live.first_nations = ea.first_nations
        AND live.description IS NOT DISTINCT FROM ea.description
        AND NOT EXISTS (
          SELECT 1 FROM template_versions tv
          WHERE tv.requirement_template_id = live.id
            AND tv.status = 1
        )
    SQL
    if cleared.positive?
      say "Cleared EA-inherited metadata on #{cleared} live template(s)."
    end
  end

  def execute_sql(sql)
    ActiveRecord::Base.connection.execute(sql).to_a
  end

  def escape_json(json_val)
    case json_val
    when String
      json_val.gsub("'", "''")
    when Hash
      json_val.to_json.gsub("'", "''")
    else
      "{}"
    end
  end

  def boolean_sql(value)
    ActiveModel::Type::Boolean.new.cast(value) ? "TRUE" : "FALSE"
  end
end

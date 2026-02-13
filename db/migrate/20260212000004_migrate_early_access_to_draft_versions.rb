class MigrateEarlyAccessToDraftVersions < ActiveRecord::Migration[7.1]
  # This migration converts existing EarlyAccessRequirementTemplate records
  # into draft TemplateVersions on LiveRequirementTemplates.
  #
  # For each EA template:
  # 1. If a matching LiveRequirementTemplate exists (same permit_type + activity),
  #    create a draft TemplateVersion on it using the EA template's published version data.
  # 2. If no matching live template exists, create a new LiveRequirementTemplate
  #    and give it a draft TemplateVersion.
  # 3. Migrate EarlyAccessPreview records to point to the new draft TemplateVersion.
  #
  # Also: set all RequirementBlock.visibility to 'any' (0).

  def up
    # Step 1: Migrate EA templates to draft versions
    ea_templates = execute_sql(<<~SQL)
      SELECT rt.id, rt.permit_type_id, rt.activity_id, rt.first_nations,
             rt.description, rt.nickname, rt.assignee_id, rt.public,
             rt.site_configuration_id, rt.discarded_at
      FROM requirement_templates rt
      WHERE rt.type = 'EarlyAccessRequirementTemplate'
        AND rt.discarded_at IS NULL
    SQL

    ea_templates.each do |ea|
      # Find matching live template
      live_template = execute_sql(<<~SQL).first
        SELECT id FROM requirement_templates
        WHERE type = 'LiveRequirementTemplate'
          AND permit_type_id = '#{ea["permit_type_id"]}'
          AND activity_id = '#{ea["activity_id"]}'
          AND first_nations = #{ea["first_nations"]}
          AND discarded_at IS NULL
        LIMIT 1
      SQL

      if live_template.nil?
        # Create a new LiveRequirementTemplate from the EA template
        execute(<<~SQL)
          INSERT INTO requirement_templates (id, permit_type_id, activity_id, first_nations,
            description, nickname, type, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            '#{ea["permit_type_id"]}',
            '#{ea["activity_id"]}',
            #{ea["first_nations"]},
            #{ea["description"] ? "'#{escape_single_quotes(ea["description"])}'" : "NULL"},
            #{ea["nickname"] ? "'#{escape_single_quotes(ea["nickname"])}'" : "NULL"},
            'LiveRequirementTemplate',
            NOW(), NOW()
          )
          RETURNING id
        SQL

        live_template = execute_sql(<<~SQL).first
          SELECT id FROM requirement_templates
          WHERE type = 'LiveRequirementTemplate'
            AND permit_type_id = '#{ea["permit_type_id"]}'
            AND activity_id = '#{ea["activity_id"]}'
            AND first_nations = #{ea["first_nations"]}
            AND discarded_at IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        SQL
      end

      next if live_template.nil?

      live_template_id = live_template["id"]

      # Check if the live template already has a draft
      existing_draft = execute_sql(<<~SQL).first
        SELECT id FROM template_versions
        WHERE requirement_template_id = '#{live_template_id}'
          AND status = 3
        LIMIT 1
      SQL

      next if existing_draft.present?

      # Get the EA template's published version data
      ea_published = execute_sql(<<~SQL).first
        SELECT denormalized_template_json, form_json, requirement_blocks_json, version_date
        FROM template_versions
        WHERE requirement_template_id = '#{ea["id"]}'
          AND status = 1
        ORDER BY version_date DESC
        LIMIT 1
      SQL

      next if ea_published.nil?

      # Create a draft TemplateVersion on the live template
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
          #{ea["public"] || false},
          #{ea["site_configuration_id"] ? "'#{ea["site_configuration_id"]}'" : "NULL"},
          NOW(), NOW()
        )
      SQL

      # Get the newly created draft version ID
      new_draft = execute_sql(<<~SQL).first
        SELECT id FROM template_versions
        WHERE requirement_template_id = '#{live_template_id}'
          AND status = 3
        ORDER BY created_at DESC
        LIMIT 1
      SQL

      next if new_draft.nil?

      # Step 2: Migrate EarlyAccessPreview records to point to the new draft
      execute(<<~SQL)
        UPDATE template_version_previews
        SET template_version_id = '#{new_draft["id"]}'
        WHERE early_access_requirement_template_id = '#{ea["id"]}'
      SQL
    end

    # Step 3: Set all RequirementBlock visibility to 'any' (0)
    execute(<<~SQL)
      UPDATE requirement_blocks
      SET visibility = 0
      WHERE visibility != 0
    SQL

    say "Migration complete. Remember to reindex search after running this migration."
    say "Run: RequirementTemplate.reindex and RequirementBlock.reindex"
  end

  def down
    say "This migration cannot be fully reversed. Manual intervention required."
    say "Draft versions created by this migration would need to be identified and removed."

    # We can at least restore the preview FK references
    # (but the draft template_versions would remain)
  end

  private

  def execute_sql(sql)
    ActiveRecord::Base.connection.execute(sql).to_a
  end

  def escape_single_quotes(str)
    str.to_s.gsub("'", "''")
  end

  def escape_json(json_val)
    if json_val.is_a?(String)
      json_val.gsub("'", "''")
    elsif json_val.is_a?(Hash)
      json_val.to_json.gsub("'", "''")
    else
      "{}"
    end
  end
end

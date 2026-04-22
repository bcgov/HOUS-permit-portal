# frozen_string_literal: true

# Converts existing EarlyAccessRequirementTemplate records into draft TemplateVersions
# on LiveRequirementTemplates, migrates previews, and normalizes requirement block
# visibility. Run after db/migrate through 20260212000004 and before
# CleanupEarlyAccessLegacyColumns (db/data/20260421165700_*).
#
# After deployment: rails data:migrate (or rely on db/seeds.rb which invokes it).

class ConvertEarlyAccessToDraftVersions < ActiveRecord::Migration[7.2]
  def up
    unless prerequisites_met?
      say "Skipping ConvertEarlyAccessToDraftVersions: schema prerequisites not met or cleanup already ran."
      return
    end

    migrate_ea_templates_to_drafts
    normalize_requirement_block_visibility

    say "ConvertEarlyAccessToDraftVersions complete. Reindex search: RequirementTemplate.reindex and RequirementBlock.reindex"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def prerequisites_met?
    table_exists?(:template_version_previews) &&
      column_exists?(
        :template_version_previews,
        :early_access_requirement_template_id
      ) && column_exists?(:requirement_templates, :assignee_id) &&
      column_exists?(:requirement_templates, :type)
  end

  def migrate_ea_templates_to_drafts
    # Include discarded EA templates so their (still-present) preview rows
    # also get relinked. For discarded EA templates we only *reuse* an
    # existing live template / draft — we never create new ones from stale
    # content.
    ea_templates = execute_sql(<<~SQL)
      SELECT rt.id, rt.permit_type_id, rt.activity_id, rt.first_nations,
             rt.description, rt.nickname, rt.assignee_id, rt.public,
             rt.site_configuration_id, rt.discarded_at
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
    # EA templates normally always have a status=1 row (enforced by
    # EarlyAccessRequirementTemplate#valid_template_version_status), but
    # guard anyway.
    return nil if ea_published.nil?

    publicly_previewable_sql = boolean_sql(ea["public"])

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
        #{publicly_previewable_sql},
        #{ea["site_configuration_id"] ? "'#{ea["site_configuration_id"]}'" : "NULL"},
        NOW(), NOW()
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

    say "#{remaining} template_version_previews still have NULL template_version_id after convert. CleanupEarlyAccessLegacyColumns will delete these truly-orphaned rows."
  end

  def normalize_requirement_block_visibility
    execute(<<~SQL)
      UPDATE requirement_blocks
      SET visibility = 0
      WHERE visibility != 0
    SQL
  end

  def execute_sql(sql)
    ActiveRecord::Base.connection.execute(sql).to_a
  end

  def escape_single_quotes(str)
    str.to_s.gsub("'", "''")
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

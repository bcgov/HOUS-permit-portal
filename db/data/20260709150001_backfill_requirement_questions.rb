# frozen_string_literal: true

# HUB-4234: 1:1 migrate each requirement placement into a bank RequirementQuestion
# and set requirements.requirement_question_id. Preserves requirement_code (FR-12).
# No label dedup. Placement-only input_options stay on requirements.
#
# Skips energy step code packages and architectural drawing — those stay
# block-local and are not question-bank catalogue rows.
#
# Rollback (staging only, before intentional multi-use catalogue edits):
#   bin/rails question_bank:rollback_backfill
class BackfillRequirementQuestions < ActiveRecord::Migration[7.2]
  PLACEMENT_INPUT_OPTION_KEYS = %w[
    conditional
    computed_compliance
    data_validation
  ].freeze

  # Keep in sync with RequirementQuestion::BANK_EXCLUDED_INPUT_TYPES (enum ints).
  EXCLUDED_INPUT_TYPES = [
    16, # energy_step_code
    20, # energy_step_code_part_3
    22 # architectural_drawing
  ].freeze

  EXCLUDED_REQUIREMENT_CODES =
    (
      Requirement::ENERGY_STEP_CODE_REQUIRED_DEPENDENCY_CODES +
        Requirement::ARCHITECTURAL_DRAWING_REQUIRED_DEPENDENCY_CODES
    ).freeze

  def up
    unless table_exists?(:requirement_questions) &&
             column_exists?(:requirements, :requirement_question_id)
      say "Skipping BackfillRequirementQuestions: schema prerequisites are missing."
      return
    end

    backfill_missing_requirement_questions
  end

  def down
    raise ActiveRecord::IrreversibleMigration,
          "Use rails question_bank:rollback_backfill or restore a DB snapshot."
  end

  private

  def backfill_missing_requirement_questions
    excluded_types_sql = EXCLUDED_INPUT_TYPES.join(", ")
    excluded_codes_sql =
      EXCLUDED_REQUIREMENT_CODES.map { |code| quote(code) }.join(", ")

    requirements = execute(<<~SQL.squish).to_a
      SELECT id, requirement_code, label, input_type, input_options, hint, instructions
      FROM requirements
      WHERE requirement_question_id IS NULL
        AND input_type NOT IN (#{excluded_types_sql})
        AND requirement_code NOT IN (#{excluded_codes_sql})
    SQL

    say "Backfilling #{requirements.size} requirement(s) into requirement_questions (1:1, no dedup)..."
    say "Excluded energy step / architectural drawing package fields from bank backfill."

    requirements.each { |requirement| create_bank_question_for(requirement) }

    remaining = execute(<<~SQL.squish).first["count"].to_i
      SELECT COUNT(*) AS count
      FROM requirements
      WHERE requirement_question_id IS NULL
    SQL

    bank_count = execute(<<~SQL.squish).first["count"].to_i
      SELECT COUNT(*) AS count FROM requirement_questions
    SQL

    say "BackfillRequirementQuestions complete. bank_rows=#{bank_count}, unlinked_requirements=#{remaining}."

    if defined?(RequirementQuestion) &&
         RequirementQuestion.respond_to?(:reindex)
      say "Reindexing RequirementQuestion for Searchkick..."
      RequirementQuestion.reindex
    end
  end

  def create_bank_question_for(requirement)
    question_id = SecureRandom.uuid
    quoted_question_id = quote(question_id)
    quoted_requirement_id = quote(requirement["id"])
    label = requirement["label"].presence || requirement["requirement_code"]
    name = label
    definition_options =
      bank_definition_input_options(requirement["input_options"])

    execute(<<~SQL.squish)
      INSERT INTO requirement_questions (
        id,
        requirement_code,
        label,
        input_type,
        input_options,
        hint,
        instructions,
        name,
        created_at,
        updated_at
      ) VALUES (
        #{quoted_question_id},
        #{quote(requirement["requirement_code"])},
        #{quote(label)},
        #{requirement["input_type"].to_i},
        #{quote_json(definition_options)},
        #{quote(requirement["hint"])},
        #{quote(requirement["instructions"])},
        #{quote(name)},
        NOW(),
        NOW()
      )
    SQL

    execute(<<~SQL.squish)
      UPDATE requirements
      SET requirement_question_id = #{quoted_question_id},
          updated_at = NOW()
      WHERE id = #{quoted_requirement_id}
        AND requirement_question_id IS NULL
    SQL
  end

  # Bank rows must not carry placement-only config (conditional / compliance /
  # data_validation). Those remain on requirements and merge at read time.
  def bank_definition_input_options(raw)
    options =
      case raw
      when Hash
        raw
      when String
        JSON.parse(raw)
      else
        {}
      end

    options.deep_stringify_keys.except(*PLACEMENT_INPUT_OPTION_KEYS)
  rescue JSON::ParserError
    {}
  end

  def quote(value)
    ActiveRecord::Base.connection.quote(value)
  end

  def quote_json(value)
    quote(value.is_a?(String) ? value : value.to_json)
  end
end

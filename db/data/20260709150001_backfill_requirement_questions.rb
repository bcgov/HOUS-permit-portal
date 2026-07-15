# frozen_string_literal: true

class BackfillRequirementQuestions < ActiveRecord::Migration[7.2]
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
    requirements = execute(<<~SQL.squish).to_a
      SELECT id, requirement_code, label, input_type, input_options, hint, instructions
      FROM requirements
      WHERE requirement_question_id IS NULL
    SQL

    say "Backfilling #{requirements.size} requirement(s) into requirement_questions (1:1, no dedup)..."

    requirements.each { |requirement| create_private_question_for(requirement) }

    remaining = execute(<<~SQL.squish).first["count"].to_i
      SELECT COUNT(*) AS count
      FROM requirements
      WHERE requirement_question_id IS NULL
    SQL

    bank_count = execute(<<~SQL.squish).first["count"].to_i
      SELECT COUNT(*) AS count FROM requirement_questions
    SQL

    say "BackfillRequirementQuestions complete. bank_rows=#{bank_count}, unlinked_requirements=#{remaining}."
  end

  def create_private_question_for(requirement)
    question_id = SecureRandom.uuid
    quoted_question_id = quote(question_id)
    quoted_requirement_id = quote(requirement["id"])

    execute(<<~SQL.squish)
      INSERT INTO requirement_questions (
        id,
        requirement_code,
        label,
        input_type,
        input_options,
        hint,
        instructions,
        shared,
        created_at,
        updated_at
      ) VALUES (
        #{quoted_question_id},
        #{quote(requirement["requirement_code"])},
        #{quote(requirement["label"])},
        #{requirement["input_type"].to_i},
        #{quote_json(requirement["input_options"])},
        #{quote(requirement["hint"])},
        #{quote(requirement["instructions"])},
        FALSE,
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

  def quote(value)
    ActiveRecord::Base.connection.quote(value)
  end

  def quote_json(value)
    quote(value.is_a?(String) ? value : value.to_json)
  end
end

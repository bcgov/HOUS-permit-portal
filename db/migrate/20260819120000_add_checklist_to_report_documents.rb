class AddChecklistToReportDocuments < ActiveRecord::Migration[7.2]
  STAGE_SQL = <<~SQL.squish
    CASE sc.current_stage
      WHEN 'pre_construction' THEN 0
      WHEN 'mid_construction' THEN 1
      WHEN 'as_built' THEN 2
    END
  SQL

  def up
    add_reference :report_documents,
                  :checklist,
                  polymorphic: true,
                  type: :uuid,
                  null: true,
                  index: false

    backfill_checklist!(
      step_code_type: "Part9StepCode",
      checklist_type: "Part9StepCode::Checklist",
      checklist_table: "part_9_step_code_checklists"
    )
    backfill_checklist!(
      step_code_type: "Part3StepCode",
      checklist_type: "Part3StepCode::Checklist",
      checklist_table: "part_3_step_code_checklists"
    )

    add_index :report_documents,
              %i[checklist_type checklist_id],
              unique: true,
              where: "checklist_id IS NOT NULL",
              name: "index_report_documents_on_checklist"
  end

  def down
    remove_index :report_documents, name: "index_report_documents_on_checklist"
    remove_reference :report_documents, :checklist, polymorphic: true
  end

  private

  def backfill_checklist!(step_code_type:, checklist_type:, checklist_table:)
    # ponytail: newest non-stale (else newest) report per step code → current_stage checklist.
    # Historical PDFs had no checklist FK; leftover rows stay unassigned.
    execute <<~SQL.squish
      UPDATE report_documents rd
      SET checklist_type = #{connection.quote(checklist_type)},
          checklist_id = c.id
      FROM (
        SELECT DISTINCT ON (step_code_id) id, step_code_id
        FROM report_documents
        ORDER BY step_code_id, stale ASC, created_at DESC
      ) latest
      JOIN step_codes sc
        ON sc.id = latest.step_code_id
       AND sc.type = #{connection.quote(step_code_type)}
      JOIN #{checklist_table} c
        ON c.step_code_id = sc.id
       AND c.stage = #{STAGE_SQL}
      WHERE rd.id = latest.id
    SQL
  end
end

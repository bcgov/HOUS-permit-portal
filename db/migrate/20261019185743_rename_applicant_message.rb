class RenameApplicantMessage < ActiveRecord::Migration[7.2]
  def up
    execute <<~SQL.squish
      UPDATE notes
      SET kind = 'jurisdiction_message'
      WHERE kind = 'applicant_message'
    SQL
  end

  def down
    execute <<~SQL.squish
      UPDATE notes
      SET kind = 'applicant_message'
      WHERE kind = 'jurisdiction_message'
    SQL
  end
end

class AddStepCodeStageToPermitApplications < ActiveRecord::Migration[7.2]
  def up
    add_column :permit_applications, :step_code_stage, :string

    execute <<~SQL.squish
      UPDATE permit_applications
      SET step_code_stage = step_codes.current_stage
      FROM step_codes
      WHERE step_codes.permit_application_id = permit_applications.id
        AND step_codes.discarded_at IS NULL
        AND step_codes.current_stage IN (
          'pre_construction',
          'mid_construction',
          'as_built'
        )
    SQL
  end

  def down
    remove_column :permit_applications, :step_code_stage
  end
end

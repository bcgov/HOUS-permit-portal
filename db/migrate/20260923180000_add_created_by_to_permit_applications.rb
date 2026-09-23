class AddCreatedByToPermitApplications < ActiveRecord::Migration[7.2]
  def up
    add_reference :permit_applications,
                  :created_by,
                  polymorphic: true,
                  type: :uuid,
                  index: true

    execute <<~SQL.squish
      UPDATE permit_applications
      SET created_by_type = 'User', created_by_id = submitter_id
      WHERE submitter_id IS NOT NULL
    SQL
  end

  def down
    remove_reference :permit_applications, :created_by, polymorphic: true
  end
end

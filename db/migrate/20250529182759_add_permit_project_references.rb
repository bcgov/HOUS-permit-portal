class AddPermitProjectReferences < ActiveRecord::Migration[7.1]
  def change
    add_reference :permit_applications,
                  :permit_project,
                  null: true,
                  foreign_key: true,
                  type: :uuid

    add_reference :step_codes,
                  :permit_project,
                  null: true,
                  foreign_key: true,
                  type: :uuid
  end
end

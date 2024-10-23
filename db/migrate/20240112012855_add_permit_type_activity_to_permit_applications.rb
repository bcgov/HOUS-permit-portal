class AddPermitTypeActivityToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_reference :permit_applications,
                  :permit_type,
                  null: false,
                  foreign_key: {
                    to_table: :permit_classifications
                  },
                  type: :uuid
    add_reference :permit_applications,
                  :activity,
                  null: false,
                  foreign_key: {
                    to_table: :permit_classifications
                  },
                  type: :uuid
  end
end

class AddUserToStepCodes < ActiveRecord::Migration[7.0]
  def change
    add_reference :step_codes,
                  :creator,
                  type: :uuid,
                  foreign_key: {
                    to_table: :users
                  },
                  null: true

    first_user = User.first
    StepCode
      .includes(:permit_application, :permit_project)
      .find_each do |step_code|
        creator =
          step_code.permit_application&.submitter ||
            step_code.permit_project&.owner || first_user
        step_code.update_column(:creator_id, creator.id) if creator
      end

    change_column_null :step_codes, :creator_id, false
  end
end

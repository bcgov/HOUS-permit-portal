class AddSubmitterIdToStepCode < ActiveRecord::Migration[7.1]
  def change
    add_reference :step_codes, :submitter, null: true, foreign_key: { to_table: :users }, type: :uuid
    add_reference :step_codes, :permit_application, null: true, foreign_key: true, type: :uuid
  end
end

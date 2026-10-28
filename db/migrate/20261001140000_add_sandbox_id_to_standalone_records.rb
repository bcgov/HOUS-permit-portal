class AddSandboxIdToStandaloneRecords < ActiveRecord::Migration[7.2]
  def change
    add_reference :step_codes,
                  :sandbox,
                  type: :uuid,
                  foreign_key: true,
                  index: true
    add_reference :pre_checks,
                  :sandbox,
                  type: :uuid,
                  foreign_key: true,
                  index: true
    add_reference :overheating_codes,
                  :sandbox,
                  type: :uuid,
                  foreign_key: true,
                  index: true
  end
end

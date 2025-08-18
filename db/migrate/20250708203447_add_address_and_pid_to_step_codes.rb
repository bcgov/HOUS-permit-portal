class AddAddressAndPidToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_column :step_codes, :full_address, :string
    add_column :step_codes, :pid, :string
    add_column :step_codes, :pin, :string
  end
end

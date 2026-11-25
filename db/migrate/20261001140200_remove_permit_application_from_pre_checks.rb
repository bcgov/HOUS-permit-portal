class RemovePermitApplicationFromPreChecks < ActiveRecord::Migration[7.2]
  def change
    remove_reference :pre_checks,
                     :permit_application,
                     type: :uuid,
                     foreign_key: true,
                     index: true
  end
end

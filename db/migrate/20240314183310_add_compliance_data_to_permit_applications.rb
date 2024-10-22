class AddComplianceDataToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications,
               :compliance_data,
               :jsonb,
               default: {
               },
               null: false
    change_column :supporting_documents,
                  :compliance_data,
                  :jsonb,
                  default: {
                  },
                  null: false
  end
end

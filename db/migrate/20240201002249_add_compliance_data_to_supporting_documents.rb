class AddComplianceDataToSupportingDocuments < ActiveRecord::Migration[7.1]
  def change
    add_column :supporting_documents, :compliance_data, :jsonb
  end
end

class AddScanStatus < ActiveRecord::Migration[7.2]
  def change
    # Add scan_status to all document tables that use FileUploader
    # Status values: pending (default), clean, infected
    %i[
      supporting_documents
      requirement_documents
      project_documents
      resource_documents
      report_documents
      design_documents
    ].each do |table_name|
      add_column table_name,
                 :scan_status,
                 :string,
                 default: "pending",
                 null: false
      add_index table_name, :scan_status
    end
  end
end

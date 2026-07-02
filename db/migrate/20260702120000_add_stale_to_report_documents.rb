class AddStaleToReportDocuments < ActiveRecord::Migration[7.2]
  def change
    add_column :report_documents, :stale, :boolean, default: false, null: false
  end
end

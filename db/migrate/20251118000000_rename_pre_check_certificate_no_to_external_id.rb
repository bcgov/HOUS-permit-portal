class RenamePreCheckCertificateNoToExternalId < ActiveRecord::Migration[7.2]
  def change
    rename_column :pre_checks, :certificate_no, :external_id
  end
end

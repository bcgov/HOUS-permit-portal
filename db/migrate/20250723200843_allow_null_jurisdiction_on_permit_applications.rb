class AllowNullJurisdictionOnPermitApplications < ActiveRecord::Migration[7.1]
  def change
    change_column_null :permit_applications, :jurisdiction_id, true
  end
end

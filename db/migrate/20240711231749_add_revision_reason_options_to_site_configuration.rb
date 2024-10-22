class AddRevisionReasonOptionsToSiteConfiguration < ActiveRecord::Migration[7.1]
  def up
    add_column :site_configurations, :revision_reason_options, :jsonb

    change_column :revision_requests, :reason_code, :string, limit: 64
  end

  def down
    # Update all existing records to have a default value of 0
    execute "UPDATE revision_requests SET reason_code = '0' WHERE reason_code IS NOT NULL"

    # Change the column back to integer
    change_column :revision_requests,
                  :reason_code,
                  "integer USING CAST(reason_code AS integer)"

    remove_column :site_configurations, :revision_reason_options
  end
end

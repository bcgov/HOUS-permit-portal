class FixJurisdictionCustomizationColumnTypo < ActiveRecord::Migration[7.1]
  def change
    rename_column :jurisdiction_template_version_customizations,
                  :customizationsa,
                  :customizations
  end
end

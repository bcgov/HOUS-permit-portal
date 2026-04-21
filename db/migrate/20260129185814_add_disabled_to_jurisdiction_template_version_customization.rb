class AddDisabledToJurisdictionTemplateVersionCustomization < ActiveRecord::Migration[
  7.2
]
  def change
    add_column :jurisdiction_template_version_customizations,
               :disabled,
               :boolean,
               default: false,
               null: false
  end
end

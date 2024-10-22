class AddTemplateVersionToPermitApplication < ActiveRecord::Migration[7.1]
  def up
    add_reference :permit_applications,
                  :template_version,
                  null: true,
                  foreign_key: true,
                  type: :uuid

    # This will attempt to maintain database validity
    # If this doesnt work just manually delete all PermitApplications on dev and test
    PermitApplication.all.each do |pa|
      pa.set_template_version
      pa.save
    end

    change_column_null :permit_applications, :template_version_id, false
  end

  def down
    # Remove the added reference
    remove_reference :permit_applications, :template_version, foreign_key: true
  end
end

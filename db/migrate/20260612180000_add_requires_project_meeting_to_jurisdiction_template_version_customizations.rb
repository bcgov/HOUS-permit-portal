class AddRequiresProjectMeetingToJurisdictionTemplateVersionCustomizations < ActiveRecord::Migration[
  7.2
]
  def change
    add_column :jurisdiction_template_version_customizations,
               :requires_project_meeting,
               :boolean,
               default: false,
               null: false
  end
end

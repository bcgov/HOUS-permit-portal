class AddTemplateVersionToPermitApplication < ActiveRecord::Migration[7.1]
  def change
    add_reference :permit_applications, :template_version, null: false, foreign_key: true, type: :uuid
  end
end

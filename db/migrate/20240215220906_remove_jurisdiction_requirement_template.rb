class RemoveJurisdictionRequirementTemplate < ActiveRecord::Migration[7.1]
  def change
    drop_table :jurisdiction_requirement_templates
  end
end

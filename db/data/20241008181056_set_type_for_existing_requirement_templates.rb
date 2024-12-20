# frozen_string_literal: true

class SetTypeForExistingRequirementTemplates < ActiveRecord::Migration[7.1]
  def up
    # Set type to 'RequirementTemplate' for all existing records
    RequirementTemplate.where(type: nil).update_all(
      type: "LiveRequirementTemplate"
    )
  end

  def down
    # Revert type back to nil or handle as needed
    RequirementTemplate.where(type: "LiveRequirementTemplate").update_all(
      type: nil
    )
  end
end

# frozen_string_literal: true

class RemoveNonPart9StepCodeRequiredSteps < ActiveRecord::Migration[7.1]
  def up
    permit_type_ids = PermitType.where.not(code: "low_residential").pluck(:id)
    PermitTypeRequiredStep.where(permit_type: permit_type_ids).delete_all
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

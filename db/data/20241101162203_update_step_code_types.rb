# frozen_string_literal: true

class UpdateStepCodeTypes < ActiveRecord::Migration[7.1]
  def up
    StepCode.update_all(type: "Part9StepCode")
  end

  def down
  end
end

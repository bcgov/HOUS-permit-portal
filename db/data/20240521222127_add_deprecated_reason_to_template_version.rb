# frozen_string_literal: true

class AddDeprecatedReasonToTemplateVersion < ActiveRecord::Migration[7.1]
  def up
    TemplateVersion.where(
      status: "deprecated",
      deprecation_reason: nil
    ).update_all(deprecation_reason: "new_publish")
  end

  def down
  end
end

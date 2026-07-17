# frozen_string_literal: true

class ReindexProjectMeeting < ActiveRecord::Migration[7.2]
  def up
    ProjectMeeting.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

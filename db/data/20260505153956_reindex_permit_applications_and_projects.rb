# frozen_string_literal: true

class ReindexPermitApplicationsAndProjects < ActiveRecord::Migration[7.2]
  def up
    PermitApplication.reindex
    PermitProject.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

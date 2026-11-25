# frozen_string_literal: true

class CreateMembershipsForCreators < ActiveRecord::Migration[7.2]
  def up
    Searchkick.callbacks(false) do
      PermitProject
        .where.not(owner_id: nil)
        .find_each(&:ensure_creator_membership!)
    end

    ProjectMembership.reindex
    PermitProject.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

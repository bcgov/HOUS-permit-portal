# frozen_string_literal: true

class SetProjectStates < ActiveRecord::Migration[7.2]
  def up
    say_with_time "Setting project states to queued for projects with non-draft permit applications" do
      updated_count = 0

      PermitProject
        .where(state: :draft)
        .find_each do |project|
          if project
               .permit_applications
               .kept
               .where.not(status: :new_draft)
               .exists?
            project.update_column(:state, PermitProject.states[:queued])
            if project.enqueued_at.nil?
              project.update_column(:enqueued_at, Time.current)
            end
            updated_count += 1
          end
        end

      "updated #{updated_count} projects to queued"
    end

    PermitProject.reindex
    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

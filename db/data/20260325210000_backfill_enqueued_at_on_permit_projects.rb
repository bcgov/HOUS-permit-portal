# frozen_string_literal: true

class BackfillEnqueuedAtOnPermitProjects < ActiveRecord::Migration[7.1]
  def up
    say_with_time "Backfilling enqueued_at for non-draft permit projects" do
      updated_count = 0

      PermitProject
        .where(enqueued_at: nil)
        .where.not(state: :draft)
        .find_each do |project|
          earliest_submitted =
            project.permit_applications.kept.minimum(:submitted_at)
          if earliest_submitted
            project.update_column(:enqueued_at, earliest_submitted)
            updated_count += 1
          end
        end

      "updated #{updated_count} projects"
    end

    PermitProject.reindex
  end

  def down
    PermitProject.where.not(enqueued_at: nil).update_all(enqueued_at: nil)
  end
end

# frozen_string_literal: true

class BackfillQueueClock < ActiveRecord::Migration[7.2]
  def up
    backfill_permit_applications
    backfill_permit_projects

    say "Reindexing PermitApplication..."
    PermitApplication.reindex
    say "Reindexing PermitProject..."
    PermitProject.reindex
    say "Reindex complete"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def backfill_permit_applications
    our_court = PermitApplication.our_court_statuses
    count = 0

    PermitApplication.find_each do |pa|
      next if pa.new_draft?

      submitted_at = pa.submitted_at
      next unless submitted_at

      if our_court.include?(pa.status)
        pa.update_columns(
          queue_clock_started_at: submitted_at,
          queue_time_seconds: 0
        )
      else
        elapsed = (Time.current - submitted_at).to_i
        elapsed = 0 if elapsed < 0
        pa.update_columns(
          queue_clock_started_at: nil,
          queue_time_seconds: elapsed
        )
      end

      count += 1
    end

    say "Backfilled #{count} permit applications"
  end

  def backfill_permit_projects
    our_court = PermitProject.our_court_states
    count = 0

    PermitProject.find_each do |pp|
      next if pp.draft?

      enqueued_at = pp.enqueued_at
      next unless enqueued_at

      if our_court.include?(pp.state)
        pp.update_columns(
          queue_clock_started_at: enqueued_at,
          queue_time_seconds: 0
        )
      else
        elapsed = (Time.current - enqueued_at).to_i
        elapsed = 0 if elapsed < 0
        pp.update_columns(
          queue_clock_started_at: nil,
          queue_time_seconds: elapsed
        )
      end

      count += 1
    end

    say "Backfilled #{count} permit projects"
  end
end

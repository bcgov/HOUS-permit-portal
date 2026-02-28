# frozen_string_literal: true

class BackfillParcelGeometry < ActiveRecord::Migration[7.2]
  def up
    projects =
      PermitProject.where.not(pid: [nil, ""]).where(parcel_geometry: nil)
    total = projects.count
    Rails.logger.info(
      "BackfillParcelGeometry: Found #{total} projects to backfill..."
    )

    success_count = 0
    error_count = 0

    projects.find_each.with_index do |project, index|
      result = Wrappers::LtsaParcelMapBc.new.get_coordinates_by_pid(project.pid)
      if result && result[:rings].present?
        project.update_columns(
          parcel_geometry: {
            rings: result[:rings]
          },
          latitude: result[:centroid].last,
          longitude: result[:centroid].first
        )
        success_count += 1
      else
        Rails.logger.warn(
          "  Skipped project #{project.id} (PID: #{project.pid}) - no geometry returned"
        )
        error_count += 1
      end

      sleep(0.5) # Throttle requests to avoid overwhelming the LTSA service
    rescue => e
      Rails.logger.error(
        "  Error for project #{project.id} (PID: #{project.pid}): #{e.message}"
      )
      error_count += 1
    end

    Rails.logger.info(
      "BackfillParcelGeometry complete: #{success_count} backfilled, #{error_count} errors"
    )
  end

  def down
    return unless Rails.env.development?

    PermitProject
      .where.not(parcel_geometry: nil)
      .update_all(parcel_geometry: nil)
    Rails.logger.info(
      "BackfillParcelGeometry: cleared parcel_geometry for all permit projects"
    )
  end
end

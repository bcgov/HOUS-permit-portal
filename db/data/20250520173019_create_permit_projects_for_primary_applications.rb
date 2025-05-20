# frozen_string_literal: true

class CreatePermitProjectsForPrimaryApplications < ActiveRecord::Migration[7.1]
  def up
    # Find all permit applications that don't have a project yet
    PermitApplication.find_each do |permit_application|
      # Skip if the permit application already has a project
      next if permit_application.permit_projects.exists?

      # Create a new permit project with this application as primary
      PermitProject.transaction do
        new_project =
          PermitProject.new(
            # Set default description for the new project
            description:
              "Project for: #{permit_application.nickname} - #{permit_application.permit_type_and_activity} at #{permit_application.full_address}".squish
          )

        # Build the primary permit application association
        new_project.build_primary_permit_project_permit_application(
          permit_application: permit_application,
          is_primary: true
        )

        new_project.save!
      end
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to create project for PermitApplication #{permit_application.id}: #{e.message}"
      raise e
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

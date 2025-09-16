# frozen_string_literal: true

class CreateProjectsForExistingPermitApplications < ActiveRecord::Migration[7.1]
  def up
    say_with_time "Creating projects for existing permit applications" do
      created_count = 0
      skipped_count = 0

      PermitApplication.find_each do |permit_application|
        # Skip if already linked to a project
        if permit_application.permit_project_id.present?
          skipped_count += 1
          next
        end

        # We require jurisdiction to create a PermitProject
        if permit_application.jurisdiction_id.blank?
          say "Skipping permit application #{permit_application.id} (no jurisdiction)",
              true
          skipped_count += 1
          next
        end

        # Build a reasonable project title
        title =
          permit_application.nickname.presence ||
            permit_application.full_address.presence ||
            permit_application.number.presence ||
            "Project for Permit Application #{permit_application.id}"

        project =
          PermitProject.create!(
            owner_id: permit_application.submitter_id,
            jurisdiction_id: permit_application.jurisdiction_id,
            title: title,
            full_address: permit_application[:full_address],
            pid: permit_application[:pid],
            pin: permit_application[:pin]
          )

        # Link the permit application to the newly created project
        permit_application.update_columns(
          permit_project_id: project.id,
          updated_at: Time.current
        )

        created_count += 1
      end

      "created #{created_count}, skipped #{skipped_count}"
    end

    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

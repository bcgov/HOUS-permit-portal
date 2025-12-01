# frozen_string_literal: true

class MoveStaffPermitApplicationsToSandbox < ActiveRecord::Migration[7.2]
  def up
    # Find all permit applications where submitter role is not "submitter" (role != 0)
    # Join with users table to check role
    PermitApplication
      .joins(:submitter)
      .where.not(users: { role: 0 })
      .where(sandbox_id: nil)
      .find_each do |permit_application|
        jurisdiction = permit_application.jurisdiction

        next unless jurisdiction.present?

        # Find the first published sandbox for this jurisdiction
        published_sandbox = jurisdiction.sandboxes.published.first

        next unless published_sandbox.present?

        # Assign the sandbox to the permit application
        permit_application.update_column(:sandbox_id, published_sandbox.id)

        puts "Assigned sandbox '#{published_sandbox.name}' to permit application ##{permit_application.id}"
      end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

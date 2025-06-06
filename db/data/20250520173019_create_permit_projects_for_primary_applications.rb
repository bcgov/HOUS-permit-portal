# frozen_string_literal: true

# This data migration now uses the main application models directly.
# Be aware that future changes to these models (e.g., new validations, removed attributes)
# could potentially break this migration if it needs to be re-run.

class CreatePermitProjectsForPrimaryApplications < ActiveRecord::Migration[7.1]
  def up
    Rails.logger.info "Starting data migration CreatePermitProjectsForPrimaryApplications..."
    PermitProjectSeederService.call
    Rails.logger.info "Data migration CreatePermitProjectsForPrimaryApplications finished."
  end

  def down
    Rails.logger.warn "The down method for CreatePermitProjectsForPrimaryApplications is not implemented. Manual cleanup may be required if reversing."
    # If you need to revert the effects of the seeder, you'd implement that logic here
    # or within the PermitProjectSeederService and call it.
    # For example:
    # PermitProjectSeederService.revert # (if you create such a method)
  end
end

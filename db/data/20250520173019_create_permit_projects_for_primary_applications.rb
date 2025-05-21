# frozen_string_literal: true

# This data migration now uses the main application models directly.
# Be aware that future changes to these models (e.g., new validations, removed attributes)
# could potentially break this migration if it needs to be re-run.

class CreatePermitProjectsForPrimaryApplications < ActiveRecord::Migration[7.1]
  def up
    # Find all permit applications that don't have a project yet
    PermitApplication.find_each do |permit_application|
      if ProjectMembership.exists?(
           item_id: permit_application.id,
           item_type: "PermitApplication"
         )
        Rails.logger.info "PermitApplication #{permit_application.id} already belongs to a project. Skipping."
        next
      end

      ActiveRecord::Base.transaction do
        description_string =
          "Project for: #{permit_application.nickname || "N/A"}"
        activity_name = permit_application.activity&.name || "N/A" # Assumes PermitApplication has an `activity` association
        permit_type_name = permit_application.permit_type&.name || "N/A" # Assumes PermitApplication has a `permit_type` association
        description_string += " - #{activity_name} / #{permit_type_name}"
        description_string += " at #{permit_application.full_address || "N/A"}"
        description_string = description_string.squish

        new_project =
          PermitProject.new(
            owner: permit_application.submitter,
            description: description_string
          )

        unless new_project.save
          Rails.logger.error "Failed to save new PermitProject for PermitApplication #{permit_application.id}: #{new_project.errors.full_messages.join(", ")}"
          raise ActiveRecord::Rollback, "Failed to save new PermitProject"
        end

        membership =
          ProjectMembership.new(
            permit_project: new_project,
            item: permit_application # This is the PermitApplication instance itself
          )

        unless membership.save
          Rails.logger.error "Failed to save ProjectMembership for PermitApplication #{permit_application.id} and Project #{new_project.id}: #{membership.errors.full_messages.join(", ")}"
          raise ActiveRecord::Rollback, "Failed to save ProjectMembership"
        end
        Rails.logger.info "Successfully created Project #{new_project.id} (Owner: #{new_project.owner_id}) and linked PermitApplication #{permit_application.id}."
      end
    rescue ActiveRecord::Rollback => e
      Rails.logger.error "Transaction rolled back for PermitApplication #{permit_application.id}: #{e.message}"
    rescue => e
      Rails.logger.error "Error processing PermitApplication #{permit_application.id}: #{e.message}\n#{e.backtrace.join("\n")}"
    end
    Rails.logger.info "Data migration CreatePermitProjectsForPrimaryApplications finished."
  end

  def down
    Rails.logger.warn "The down method for CreatePermitProjectsForPrimaryApplications is not implemented. Manual cleanup may be required if reversing."
    # Consider if specific cleanup is needed, e.g., deleting ProjectMembership or PermitProject records created by this migration.
    # This can be complex if projects could also be created by other means.
  end
end

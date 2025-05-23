# app/services/permit_project_seeder_service.rb
class PermitProjectSeederService
  def self.call
    new.seed
  end

  def seed
    Rails.logger.info "PermitProjectSeederService: Starting to create permit projects for primary applications."

    PermitApplication.find_each do |permit_application|
      if ProjectMembership.exists?(
           item_id: permit_application.id,
           item_type: "PermitApplication"
         )
        Rails.logger.info "PermitProjectSeederService: PermitApplication #{permit_application.id} already belongs to a project. Skipping."
        next
      end

      ActiveRecord::Base.transaction do
        description_string =
          "Project for: #{permit_application.nickname || "N/A"}"
        activity_name = permit_application.activity&.name || "N/A"
        permit_type_name = permit_application.permit_type&.name || "N/A"
        description_string += " - #{activity_name} / #{permit_type_name}"
        description_string += " at #{permit_application.full_address || "N/A"}"
        description_string = description_string.squish

        new_project =
          PermitProject.new(
            owner: permit_application.submitter, # Assumes permit_application.submitter is the correct owner
            description: description_string
          )

        unless new_project.save
          Rails.logger.error "PermitProjectSeederService: Failed to save new PermitProject for PermitApplication #{permit_application.id}: #{new_project.errors.full_messages.join(", ")}"
          raise ActiveRecord::Rollback, "Failed to save new PermitProject"
        end

        membership =
          ProjectMembership.new(
            permit_project: new_project,
            item: permit_application
          )

        unless membership.save
          Rails.logger.error "PermitProjectSeederService: Failed to save ProjectMembership for PermitApplication #{permit_application.id} and Project #{new_project.id}: #{membership.errors.full_messages.join(", ")}"
          raise ActiveRecord::Rollback, "Failed to save ProjectMembership"
        end
        Rails.logger.info "PermitProjectSeederService: Successfully created Project #{new_project.id} (Owner: #{new_project.owner_id}) and linked PermitApplication #{permit_application.id}."
      end
    rescue ActiveRecord::Rollback => e
      Rails.logger.error "PermitProjectSeederService: Transaction rolled back for PermitApplication #{permit_application.id}: #{e.message}"
      # Optionally, decide if a single rollback should stop the whole process or just this iteration
    rescue => e
      Rails.logger.error "PermitProjectSeederService: Error processing PermitApplication #{permit_application.id}: #{e.message}\n#{e.backtrace.join("\n")}"
      # Optionally, decide if a single error should stop the whole process or just this iteration
    end
    Rails.logger.info "PermitProjectSeederService: Finished creating permit projects."
  end
end

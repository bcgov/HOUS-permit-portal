# app/services/permit_project_seeder_service.rb
class PermitProjectSeederService
  def self.call
    new.seed
  end

  def seed
    Rails.logger.info "PermitProjectSeederService: Starting to create permit projects for applications."

    PermitApplication.find_each do |permit_application|
      if permit_application.permit_project.present?
        Rails.logger.info "PermitProjectSeederService: PermitApplication #{permit_application.id} already has an associated PermitProject #{permit_application.permit_project_id}. Skipping."
        next
      end

      # Values to be moved from PermitApplication to PermitProject
      # IMPORTANT: These attributes must be read from permit_application *before* they are potentially removed by DB migrations.
      # This assumes you run the seeder or a data migration *before* dropping columns from permit_applications table.
      pa_jurisdiction_id =
        permit_application.read_attribute_before_type_cast(:jurisdiction_id)
      pa_nickname =
        permit_application.read_attribute_before_type_cast(:nickname)
      pa_full_address =
        permit_application.read_attribute_before_type_cast(:full_address)
      pa_pid = permit_application.read_attribute_before_type_cast(:pid)
      pa_pin = permit_application.read_attribute_before_type_cast(:pin)

      ActiveRecord::Base.transaction do
        project_name_for_description = pa_nickname || "N/A"
        activity_name = permit_application.activity&.name || "N/A"
        permit_type_name = permit_application.permit_type&.name || "N/A"
        address_for_description = pa_full_address || "N/A"

        description_string =
          "Project for: #{project_name_for_description} - #{activity_name} / #{permit_type_name} at #{address_for_description}"
        description_string = description_string.squish

        new_project_attributes = {
          owner: permit_application.submitter,
          description: description_string,
          name: pa_nickname, # Set project name from old PA nickname
          jurisdiction_id: pa_jurisdiction_id,
          full_address: pa_full_address,
          address: pa_full_address, # Assuming PermitProject uses 'address' for consistency with concern
          pid: pa_pid,
          pin: pa_pin
          # project_start_date: Time.current # Or some other default if applicable
        }
        # Ensure your PermitProject model has :name, :address, :pid, :pin, :jurisdiction_id attributes

        new_project = PermitProject.new(new_project_attributes)

        unless new_project.save
          Rails.logger.error "PermitProjectSeederService: Failed to save new PermitProject for PermitApplication #{permit_application.id}: #{new_project.errors.full_messages.join(", ")}"
          raise ActiveRecord::Rollback, "Failed to save new PermitProject"
        end

        permit_application.permit_project = new_project
        # PermitApplication no longer directly saves jurisdiction_id, nickname, full_address, pid, pin.
        # These are now on the project. The `permit_project=` association is what needs saving.
        unless permit_application.save # This saves the permit_project_id on permit_application
          Rails.logger.error "PermitProjectSeederService: Failed to associate PermitApplication #{permit_application.id} with Project #{new_project.id}: #{permit_application.errors.full_messages.join(", ")}"
          raise ActiveRecord::Rollback,
                "Failed to save PermitApplication with new project association"
        end

        Rails.logger.info "PermitProjectSeederService: Successfully created Project #{new_project.id} (Jurisdiction: #{new_project.jurisdiction_id}, Name: #{new_project.name}) and linked to PermitApplication #{permit_application.id}."
      end
    rescue ActiveRecord::Rollback => e
      Rails.logger.error "PermitProjectSeederService: Transaction rolled back for PermitApplication #{permit_application.id}: #{e.message}"
    rescue => e
      Rails.logger.error "PermitProjectSeederService: Error processing PermitApplication #{permit_application.id}: #{e.message}\n#{e.backtrace.join("\n")}"
    end
    Rails.logger.info "PermitProjectSeederService: Finished creating permit projects."
  end
end

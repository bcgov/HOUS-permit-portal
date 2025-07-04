# app/services/permit_project_seeder_service.rb
class PermitProjectSeederService
  def self.call
    new.seed
  end

  def seed
    Rails.logger.info "PermitProjectSeederService: Starting to create permit projects for applications."

    application_ids = PermitApplication.pluck(:id)
    Rails.logger.info "PermitProjectSeederService: Found #{application_ids.count} PermitApplication ID(s) to process: #{application_ids.inspect}"

    application_ids.each do |pa_id|
      permit_application = PermitApplication.find(pa_id)
      Rails.logger.info "PermitProjectSeederService: Processing PA ID: #{pa_id}. Current permit_project_id on PA: #{permit_application.permit_project_id}"

      if permit_application.permit_project_id.present?
        Rails.logger.info "PermitProjectSeederService: PermitApplication #{permit_application.id} already has an associated PermitProject #{permit_application.permit_project_id}. Skipping."
        next
      end

      pa_jurisdiction_id =
        permit_application.read_attribute_before_type_cast(:jurisdiction_id)
      pa_nickname =
        permit_application.read_attribute_before_type_cast(:nickname)
      pa_full_address =
        permit_application.read_attribute_before_type_cast(:full_address)
      pa_pid = permit_application.read_attribute_before_type_cast(:pid)
      pa_pin = permit_application.read_attribute_before_type_cast(:pin)

      Rails.logger.info "PermitProjectSeederService: For PA #{pa_id} - Old Jurisdiction ID: #{pa_jurisdiction_id.inspect}, Nickname: #{pa_nickname.inspect}"

      if pa_jurisdiction_id.blank?
        Rails.logger.warn "PermitProjectSeederService: PA #{pa_id} - Skipping PermitProject creation because old jurisdiction_id is blank."
        next # Skip to the next permit_application
      end

      ActiveRecord::Base.transaction do
        project_name_for_title = pa_nickname || "N/A"
        activity_name = permit_application.activity&.name || "N/A"
        permit_type_name = permit_application.permit_type&.name || "N/A"
        address_for_title = pa_full_address || "N/A"

        title_string =
          "Project for: #{project_name_for_title} - #{activity_name} / #{permit_type_name} at #{address_for_title}"
        title_string = title_string.squish

        new_project_attributes = {
          owner: permit_application.submitter,
          title: title_string,
          jurisdiction_id: pa_jurisdiction_id,
          full_address: pa_full_address,
          pid: pa_pid,
          pin: pa_pin
        }
        Rails.logger.info "PermitProjectSeederService: PA #{pa_id} - Attempting to create PermitProject with attributes: #{new_project_attributes.except(:owner).merge(owner_id: permit_application.submitter&.id)}"

        new_project = PermitProject.new(new_project_attributes)

        Rails.logger.info "PermitProjectSeederService: PA #{pa_id} - Is new_project valid? #{new_project.valid?}"
        unless new_project.valid?
          Rails.logger.error "PermitProjectSeederService: PA #{pa_id} - PermitProject validation errors: #{new_project.errors.full_messages.join(", ")}"
        end

        unless new_project.save
          Rails.logger.error "PermitProjectSeederService: Failed to save new PermitProject for PA #{permit_application.id}: #{new_project.errors.full_messages.join(", ")}. Rolling back."
          raise ActiveRecord::Rollback, "Failed to save new PermitProject"
        end
        Rails.logger.info "PermitProjectSeederService: PA #{pa_id} - Successfully saved new PermitProject #{new_project.id}."

        permit_application.permit_project = new_project
        Rails.logger.info "PermitProjectSeederService: PA #{pa_id} - Is permit_application valid before saving association? #{permit_application.valid?}"
        unless permit_application.valid?
          Rails.logger.error "PermitProjectSeederService: PA #{pa_id} - PermitApplication validation errors before saving association: #{permit_application.errors.full_messages.join(", ")}"
        end

        unless permit_application.save
          Rails.logger.error "PermitProjectSeederService: Failed to associate PA #{permit_application.id} with Project #{new_project.id}: #{permit_application.errors.full_messages.join(", ")}. Rolling back."
          raise ActiveRecord::Rollback,
                "Failed to save PA with new project association"
        end
        Rails.logger.info "PermitProjectSeederService: PA #{pa_id} - Successfully associated PA with Project #{new_project.id}."

        if permit_application.step_codes.any?
          permit_application.step_codes.each do |sc|
            sc.permit_project = new_project
            unless sc.save
              Rails.logger.error "PermitProjectSeederService: Failed to associate StepCode #{sc.id} with Project #{new_project.id}: #{sc.errors.full_messages.join(", ")}"
              raise ActiveRecord::Rollback,
                    "Failed to save StepCode with new project association"
            end
          end
          Rails.logger.info "PermitProjectSeederService: Updated #{permit_application.step_codes.count} StepCode(s) for PA #{permit_application.id} to link to Project #{new_project.id}."
        end

        Rails.logger.info "PermitProjectSeederService: Successfully created Project #{new_project.id} for PA #{permit_application.id}."
      end
    rescue ActiveRecord::Rollback => e
      Rails.logger.error "PermitProjectSeederService: Transaction rolled back for PA #{pa_id}: #{e.message}"
    rescue => e
      Rails.logger.error "PermitProjectSeederService: Error processing PA #{pa_id}: #{e.message}\n#{e.backtrace.join("\n")}"
    end
    Rails.logger.info "PermitProjectSeederService: Finished creating permit projects."
  end
end

require "csv"

namespace :jurisdiction do
  desc "Import PermitTypeRequiredStep data from the CSV template, creating only new records."
  task import_required_steps: :environment do
    input_path = Rails.root.join("data", "required_steps_template.csv")

    unless File.exist?(input_path)
      puts "Error: CSV template file not found at #{input_path}"
      puts "Please run 'rake jurisdiction:generate_required_steps_template' first and fill out the template."
      exit 1 # Exit the task if the file doesn't exist
    end

    created_count = 0
    skipped_no_data_count = 0
    skipped_invalid_data_count = 0
    skipped_lookup_fail_count = 0
    skipped_existing_record_count = 0

    puts "Starting import from #{input_path}... (Will only create new records)"

    CSV.foreach(input_path, headers: true, skip_blanks: true) do |row|
      jurisdiction_slug = row["Jurisdiction Slug (Do not change)"]
      permit_type_code = row["Permit Type Code (Do not change)"]
      energy_step_str = row["Energy Step Required (0, 3, 4, or 5)"]&.strip
      zero_carbon_step_str =
        row["Zero Carbon Step Required (0, 1, 2, 3, or 4)"]&.strip

      jurisdiction = Jurisdiction.find_by(slug: jurisdiction_slug)
      unless jurisdiction
        puts "Skipping row: Jurisdiction with slug '#{jurisdiction_slug}' not found."
        skipped_lookup_fail_count += 1
        next
      end

      permit_type = PermitType.find_by(code: permit_type_code)
      unless permit_type
        puts "Skipping row: PermitType with code '#{permit_type_code}' not found."
        skipped_lookup_fail_count += 1
        next
      end

      unless energy_step_str.present? && zero_carbon_step_str.present?
        if energy_step_str.present? || zero_carbon_step_str.present?
          puts "Skipping row: Both Energy and Zero Carbon steps must be provided for #{jurisdiction_slug}/#{permit_type_code}."
        end
        skipped_no_data_count += 1
        next
      end

      if PermitTypeRequiredStep.exists?(
           jurisdiction_id: jurisdiction.id,
           permit_type_id: permit_type.id
         )
        skipped_existing_record_count += 1
        next
      end

      energy_step = nil
      begin
        energy_step = Integer(energy_step_str)
        unless [0, 3, 4, 5].include?(energy_step)
          puts "Skipping row: Invalid Energy Step '#{energy_step_str}' for #{jurisdiction_slug}/#{permit_type_code}. Must be 0, 3, 4, or 5."
          skipped_invalid_data_count += 1
          next
        end
      rescue ArgumentError
        puts "Skipping row: Non-integer Energy Step '#{energy_step_str}' for #{jurisdiction_slug}/#{permit_type_code}."
        skipped_invalid_data_count += 1
        next
      end

      zero_carbon_step = nil
      begin
        zero_carbon_step = Integer(zero_carbon_step_str)
        unless [0, 1, 2, 3, 4].include?(zero_carbon_step)
          puts "Skipping row: Invalid Zero Carbon Step '#{zero_carbon_step_str}' for #{jurisdiction_slug}/#{permit_type_code}. Must be 0, 1, 2, 3, or 4."
          skipped_invalid_data_count += 1
          next
        end
      rescue ArgumentError
        puts "Skipping row: Non-integer Zero Carbon Step '#{zero_carbon_step_str}' for #{jurisdiction_slug}/#{permit_type_code}."
        skipped_invalid_data_count += 1
        next
      end

      required_step =
        PermitTypeRequiredStep.new(
          jurisdiction_id: jurisdiction.id,
          permit_type_id: permit_type.id
        )

      required_step.energy_step_required = energy_step
      required_step.zero_carbon_step_required = zero_carbon_step

      begin
        if required_step.save
          created_count += 1
        else
          puts "Skipping row: Failed to save NEW record for #{jurisdiction.slug} / #{permit_type.code}. Errors: #{required_step.errors.full_messages.join(", ")}"
          skipped_invalid_data_count += 1
        end
      rescue => e
        puts "Skipping row: Error saving NEW record for #{jurisdiction.slug} / #{permit_type.code}. Error: #{e.message}"
        skipped_invalid_data_count += 1
      end
    end

    puts "\nImport finished."
    puts "Records created: #{created_count}"
    puts "Rows skipped (missing Jurisdiction/PermitType): #{skipped_lookup_fail_count}"
    puts "Rows skipped (missing Energy or Zero Carbon value): #{skipped_no_data_count}"
    puts "Rows skipped (record already existed): #{skipped_existing_record_count}"
    puts "Rows skipped (invalid data or save error): #{skipped_invalid_data_count}"
  end
end

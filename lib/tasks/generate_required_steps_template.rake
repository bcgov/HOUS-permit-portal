require "csv"

namespace :jurisdiction do
  desc "Generate a CSV template for inputting PermitTypeRequiredStep data, preserving existing values."
  task generate_required_steps_template: :environment do
    # Changed output path to data/ directory for version control
    output_path = Rails.root.join("data", "required_steps_template.csv")
    existing_data = {}

    # Define header keys for easier reference
    header_jurisdiction_slug = "Jurisdiction Slug (Do not change)"
    header_permit_type_name = "Permit Type Name (Do not change)"
    header_permit_type_code = "Permit Type Code (Do not change)"
    header_energy_step = "Energy Step Required (0, 3, 4, or 5)" # Updated valid values
    header_zero_carbon_step = "Zero Carbon Step Required (0, 1, 2, 3, or 4)" # Updated valid values

    # --- Read existing data if file exists ---
    if File.exist?(output_path)
      puts "Reading existing data from #{output_path}..."
      begin
        CSV.foreach(output_path, headers: true, skip_blanks: true) do |row|
          # Use defined header keys for reading
          if row[header_jurisdiction_slug] && row[header_permit_type_code]
            key =
              "#{row[header_jurisdiction_slug]}|#{row[header_permit_type_code]}"
            existing_data[key] = {
              # Use defined header keys for reading existing values
              energy: row[header_energy_step],
              zero_carbon: row[header_zero_carbon_step]
            }
          else
            puts "Skipping row due to missing key columns: #{row.to_hash}"
          end
        end
        puts "Finished reading existing data. Found #{existing_data.count} entries."
      rescue CSV::MalformedCSVError => e
        puts "Error reading existing CSV: #{e.message}. Starting with a blank template."
        existing_data = {} # Reset data if CSV is corrupt
      rescue => e # Catch other potential errors like permission issues
        puts "An unexpected error occurred while reading #{output_path}: #{e.message}. Starting with a blank template."
        existing_data = {} # Reset data on other errors
      end
    else
      puts "No existing template found at #{output_path}. Creating a new one."
    end
    # -------------------------------------------

    enabled_permit_types = PermitType.where(enabled: true).order(:code)
    jurisdictions = Jurisdiction.order(:slug)

    # Use defined header keys for writing the header row
    headers = [
      header_jurisdiction_slug,
      header_permit_type_name,
      header_permit_type_code,
      header_energy_step,
      header_zero_carbon_step
    ]

    puts "Generating new template..."
    # Ensure the directory exists before writing
    FileUtils.mkdir_p(File.dirname(output_path))

    CSV.open(output_path, "wb") do |csv|
      csv << headers

      jurisdictions.each do |jurisdiction|
        enabled_permit_types.each do |permit_type|
          lookup_key = "#{jurisdiction.slug}|#{permit_type.code}"
          data = existing_data[lookup_key]

          energy_value = data ? data[:energy] : ""
          zero_carbon_value = data ? data[:zero_carbon] : ""

          row = [
            jurisdiction.slug,
            permit_type.name,
            permit_type.code,
            energy_value,
            zero_carbon_value
          ]
          csv << row
        end
      end
    end

    puts "CSV template generated/updated successfully at: #{output_path}"
    puts "Found #{jurisdictions.count} jurisdictions and #{enabled_permit_types.count} enabled permit types."
    puts "Total rows generated (excluding header): #{jurisdictions.count * enabled_permit_types.count}"
    puts "NOTE: The import task will only process rows where BOTH step values are provided and valid."
  end
end

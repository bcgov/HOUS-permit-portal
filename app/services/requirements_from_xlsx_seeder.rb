class RequirementsFromXlsxSeeder
  def self.seed
    file_name = "#{Rails.root}/db/templates/Core Permit Requirements List.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      req_sheet = xlsx.sheet("Dev-Requirements")
      parsed_req_sheet = req_sheet.parse(headers: true)

      errors = []

      parsed_req_sheet.each do |row|
        if row["requirement_code"] && row["requirement_code"] != "requirement_code" #skip anything with no code
          begin
            requirement =
              Requirement.where(requirement_code: row["requirement_code"]).find_or_initialize_by(
                requirement_code: row["requirement_code"],
              )
            requirement.update!(
              label: row["display_label"],
              input_type: row["input_type"],
              hint: row["hint"],
              required: row["required"].present?,
              input_options: row["input_options"].blank? ? {} : JSON.parse(row["input_options"]), #if parse fails it will raise error
              #required_for_in_person_hint - text
              #reusable - boolean
              required_for_multiple_owners: row["required_for_multiple_owners"].present?,
            )
          rescue StandardError => e #ArgumentError, ActiveRecord::ActiveRecordError => e
            errors << "Error loading #{row["requirement_code"]} - #{e.message}"
          end
        end
      end
      #loop through requirements and do first or update.  At some point we will not allow updating.

      #low density new construction
      new_res_low_sheet = xlsx.sheet("Dev-RequirementBlocks-House")

      #medium density new contruction
      new_res_med_sheet = xlsx.sheet("Dev-RequirementBlocks-Townhouse")

      puts errors
    end
  end
end

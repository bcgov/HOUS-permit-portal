class RequirementsFromXlsxSeeder
  def self.seed
    file_name = "#{Rails.root}/db/templates/Core Permit Requirements List.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      req_sheet = xlsx.sheet("Dev-Requirements")
      parsed_req_sheet = req_sheet.parse(headers: true)

      errors = ["Requirements Loading"]

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
              reusable: true, #TODO: DECIDE WHAT CASES ARE NON REUSABLE?
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

      setup_requirement_template(
        "new_construction",
        "low_residential",
        xlsx.sheet("Dev-RequirementBlocks-House"),
        errors,
      )

      #medium density new contruction
      # setup_requirement_template(
      #   "new_construction",
      #   "medium_residential",
      #   xlsx.sheet("Dev-RequirementBlocks-Townhouse"),
      #   errors,
      # )

      puts errors
    end
  end

  private

  def self.setup_requirement_template(activity, permit_type, sheet, errors)
    errors << "#{activity} #{permit_type} loading"

    #create requirements blocks
    activity = Activity.find_by_code!(activity)
    permit_type = PermitType.find_by_code!(permit_type)
    requirement_template =
      RequirementTemplate.where(activity: activity, permit_type: permit_type).first_or_create(
        activity: activity,
        permit_type: permit_type,
      )
    setup_sheet(activity, permit_type, sheet, requirement_template, errors)
  end

  def self.setup_sheet(activity, permit_type, sheet, requirement_template, errors)
    rs_position_incrementer = 0
    #create sections first and order them
    sheet
      .column(1)
      .drop(3)
      .compact
      .uniq
      .each do |section_name|
        rs =
          requirement_template
            .requirement_template_sections
            .where(name: section_name)
            .first_or_create!(name: section_name)
        rs.update!(position: rs_position_incrementer)
        rs_position_incrementer += 1
      end

    rstrb_position_incrementer = {}
    (4..sheet.last_row).each do |row_index|
      begin
        #https://www.vishalon.net/blog/excel-column-letter-to-number-quick-reference but -1 for ruby
        #if column A(0) Section, C(2) Fieldset and L(11) value

        #go through each requirement block and add them to each section
        if sheet.row(row_index)[0].present? && sheet.row(row_index)[2] && sheet.row(row_index)[11].present?
          req_template_section =
            requirement_template.requirement_template_sections.find { |rs| rs.name == sheet.row(row_index)[0] }
          rb = RequirementBlock.where(name: sheet.row(row_index)[2]).first_or_create!(name: sheet.row(row_index)[2])
          req_position_incrementer = 0
          (11..21).each_with_index do |req_col, req_position|
            val = sheet.row(row_index)[req_col]
            if val.present?
              requirement = Requirement.find_by_requirement_code(val)
              if requirement
                rbr =
                  rb
                    .requirement_block_requirements
                    .where(requirement: requirement)
                    .first_or_initialize(requirement: requirement)
                rbr.update!(requirement: requirement, position: req_position_incrementer)
                req_position_incrementer += 1
              end
            end
          end

          rsrb =
            req_template_section
              .requirement_template_section_requirement_blocks
              .where(requirement_block: rb)
              .first_or_initialize(requirement_block: rb)
          rsrb.update!(position: rstrb_position_incrementer[req_template_section.name] || 0)
          rstrb_position_incrementer[req_template_section.name].present? ?
            rstrb_position_incrementer[req_template_section.name] += 1 :
            rstrb_position_incrementer[req_template_section.name] = 1
        end
      rescue StandardError => e
        errors << "Error loading #{activity} #{permit_type} - row:#{row_index} - #{e.message}"
      end
    end
  end
end

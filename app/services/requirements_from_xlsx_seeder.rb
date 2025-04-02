class RequirementsFromXlsxSeeder
  def self.seed
    file_name = "#{Rails.root}/db/templates/Core Permit Requirements List.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      req_sheet = xlsx.sheet("Dev-Requirements")
      parsed_req_sheet = req_sheet.parse(headers: true)
      valid_rows =
        parsed_req_sheet.select do |row|
          row["requirement_code"] &&
            row["requirement_code"] != "requirement_code"
        end
      errors = ["Requirements Loading"]

      setup_requirement_template(
        "new_construction",
        "low_residential",
        xlsx.sheet("Dev-RequirementBlocks-House"),
        valid_rows,
        errors
      )

      puts errors
    end
    RequirementTemplate.reindex
  end

  def self.seed_medium
    file_name = "#{Rails.root}/db/templates/Core Permit Requirements List.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      req_sheet = xlsx.sheet("Dev-Requirements")
      parsed_req_sheet = req_sheet.parse(headers: true)
      valid_rows =
        parsed_req_sheet.select do |row|
          row["requirement_code"] &&
            row["requirement_code"] != "requirement_code"
        end
      errors = ["Requirements Loading"]

      setup_requirement_template(
        "new_construction",
        "medium_residential",
        xlsx.sheet("TEST-ReqBlocks-Mid.densityHouse"),
        valid_rows,
        errors
      )

      puts errors
    end
    RequirementTemplate.reindex
  end

  def self.clear
    Requirement.destroy_all
    RequirementBlock.destroy_all
    RequirementTemplateSection.destroy_all
  end

  private

  def self.setup_requirement_template(
    activity,
    permit_type,
    sheet,
    valid_rows,
    errors
  )
    errors << "#{activity} #{permit_type} loading"

    # create requirements blocks
    activity = Activity.find_by_code!(activity)
    permit_type = PermitType.find_by_code!(permit_type)
    requirement_template =
      LiveRequirementTemplate.where(
        activity: activity,
        permit_type: permit_type
      ).first_or_create(activity: activity, permit_type: permit_type)
    setup_sheet(
      activity,
      permit_type,
      sheet,
      requirement_template,
      valid_rows,
      errors
    )

    requirement_template.reload

    force_a_published_template_version(requirement_template)
  end

  def self.force_a_published_template_version(requirement_template)
    return if requirement_template.published_template_version.present?

    version_date = Date.yesterday
    template_version = nil

    Timecop.freeze(version_date - 1) do
      template_version =
        TemplateVersioningService.schedule!(requirement_template, version_date)
    end

    return if template_version.blank?

    Timecop.freeze(version_date) do
      template_version =
        TemplateVersioningService.publish_version!(template_version)
    end
  end

  def self.setup_sheet(
    activity,
    permit_type,
    sheet,
    requirement_template,
    valid_rows,
    errors
  )
    rs_position_incrementer = 0
    # create sections first and order them
    sheet
      .column(1)
      .drop(3)
      .compact
      .uniq
      .reject { |section_name| section_name.blank? }
      .each do |section_name|
        rs =
          requirement_template
            .requirement_template_sections
            .where(name: section_name.strip)
            .first_or_create!(name: section_name.strip)
        rs.update!(position: rs_position_incrementer)
        rs_position_incrementer += 1
      end

    rstrb_position_incrementer = {}
    (4..sheet.last_row).each do |row_index|
      begin
        # https://www.vishalon.net/blog/excel-column-letter-to-number-quick-reference but -1 for ruby
        # if column A(0) Section, C(2) Requirement Block Internal Name C(2) Requirement Block Display Name and L(11) value

        # go through each requirement block and add them to each section
        if sheet.row(row_index)[0].present? && sheet.row(row_index)[2] &&
             (
               sheet.row(row_index)[3].present? ||
                 sheet.row(row_index)[11].present?
             )
          req_template_section =
            requirement_template.requirement_template_sections.find do |rs|
              rs.name == sheet.row(row_index)[0].strip
            end
          internal_name = sheet.row(row_index)[1]&.strip
          display_name = sheet.row(row_index)[2]&.strip
          internal_name = display_name if internal_name.blank?

          rb =
            RequirementBlock.where(name: internal_name).first_or_create!(
              name: internal_name,
              display_name: display_name,
              display_description:
                (
                  if (sheet.row(row_index)[3])&.strip.blank?
                    ""
                  else
                    (sheet.row(row_index)[3])&.strip
                  end
                )
            ) #unicode has blank (nbsp) from excel

          if sheet.row(row_index)[11].present?
            req_vals =
              (11..29)
                .map { |req_col| sheet.row(row_index)[req_col] }
                .reject(&:blank?)
            self.setup_requirements(rb, valid_rows, req_vals, errors)

            rsrb =
              req_template_section
                .template_section_blocks
                .where(requirement_block: rb)
                .first_or_initialize(requirement_block: rb)
            rsrb.update!(
              position:
                rstrb_position_incrementer[req_template_section.name] || 0
            )
            rstrb_position_incrementer[req_template_section.name].present? ?
              rstrb_position_incrementer[req_template_section.name] += 1 :
              rstrb_position_incrementer[req_template_section.name] = 1
          end
        end
      rescue StandardError => e
        errors << "Error loading #{activity.name} #{permit_type.name} - row:#{row_index} - #{e.message}"
      end
    end
  end

  def self.setup_requirements(
    requirement_block,
    valid_rows,
    requirement_block_requirement_codes,
    errors
  )
    req_position_incrementer =
      (
        if requirement_block.requirements.present?
          requirement_block.requirements.pluck(:position).max + 1
        else
          0
        end
      )
    requirement_block_requirement_codes.each do |val|
      row = valid_rows.find { |v| v["requirement_code"] == val }
      if row.present?
        begin
          requirement =
            requirement_block
              .requirements
              .where(requirement_code: "#{row["requirement_code"]}")
              .find_or_initialize_by(
                requirement_code: "#{row["requirement_code"]}"
              )
          requirement.update!(
            label: row["display_label"],
            input_type: row["input_type"],
            hint: row["hint"],
            required: row["required"].present?,
            # reusable: true, #TODO: DECIDE WHAT CASES ARE NON REUSABLE?
            input_options:
              (
                if row["input_options"].blank?
                  {}
                else
                  JSON.parse(row["input_options"])
                end
              ), # if parse fails it will raise error
            # required_for_in_person_hint - text
            # reusable - boolean
            elective: row["elective"].present?,
            position: req_position_incrementer
          )
          req_position_incrementer += 1
        rescue StandardError => e # ArgumentError, ActiveRecord::ActiveRecordError => e
          errors << "Error loading #{row["requirement_code"]} - #{e.message}"
        end
      end
    end

    # loop through requirements and do first or update.  At some point we will not allow updating.

    # have to reindex so that requirement blocks get the fields indexed from requirements
    RequirementBlock.reindex
  end
end

class TemplateExportService
  attr_accessor :template_version, :customizations

  def initialize(
    template_version,
    jurisdiction_template_version_customizations = nil
  )
    self.template_version = template_version
    self.customizations =
      jurisdiction_template_version_customizations&.customizations
  end

  def summary_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.requirement_summary_csv_headers").split(",")
      json_requirements = template_version.form_json_requirements
      json_requirements.each do |req|
        jurisdictions_count = Jurisdiction.count

        label = req["label"]
        is_elective = req["elective"]
        count_of_jurisdictions_using =
          (
            if req["elective"]
              JurisdictionTemplateVersionCustomization.count_of_jurisdictions_using_requirement(
                req["requirement_block_id"],
                req["id"]
              )
            else
              jurisdictions_count
            end
          )
        reason_bylaw_count =
          JurisdictionTemplateVersionCustomization.requirement_count_by_reason(
            req["requirement_block_id"],
            req["id"],
            "bylaw"
          )
        reason_policy_count =
          JurisdictionTemplateVersionCustomization.requirement_count_by_reason(
            req["requirement_block_id"],
            req["id"],
            "policy"
          )
        reason_zoning_count =
          JurisdictionTemplateVersionCustomization.requirement_count_by_reason(
            req["requirement_block_id"],
            req["id"],
            "zoning"
          )

        csv << [
          label,
          is_elective,
          count_of_jurisdictions_using,
          reason_bylaw_count,
          reason_policy_count,
          reason_zoning_count
        ]
      end
    end
  end

  def to_json
    {
      "form_json" => template_version.form_json,
      "customizations" => customizations || {}
    }.to_json
  end

  def to_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.template_version_csv_headers").split(",")
      template_version
        .requirement_blocks_json
        .each_pair do |block_id, requirement_block|
        tip = customizations&.dig("requirement_block_changes", block_id, "tip")
        csv << [requirement_block["name"], tip, nil, nil, nil, nil, nil, nil]
        requirement_block["requirements"].each do |requirement|
          question = requirement["label"]
          requirement_code = requirement["requirement_code"]
          input_type = requirement["input_type"]
          optional = !(requirement["required"] || false)
          is_elective = requirement["elective"] || false

          elective_enabled =
            customizations&.dig(
              "requirement_block_changes",
              block_id,
              "enabled_elective_field_ids"
            )&.include?(requirement["id"]) || false

          elective_reason =
            customizations&.dig(
              "requirement_block_changes",
              block_id,
              "enabled_elective_field_reasons",
              requirement["id"]
            )

          csv << [
            nil,
            nil,
            question,
            requirement_code,
            input_type,
            optional,
            is_elective,
            elective_enabled,
            elective_reason
          ]
        end
      end
    end
  end
end

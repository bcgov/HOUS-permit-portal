class TemplateExportService
  attr_accessor :template_version, :customizations

  def initialize(template_version, jurisdiction_template_version_customizations)
    self.template_version = template_version
    self.customizations = jurisdiction_template_version_customizations&.customizations
  end

  def to_json
    { "form_json" => template_version.form_json, "customizations" => customizations || {} }.to_json
  end

  def to_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.template_version_csv_headers").split(",")
      template_version.form_json["components"].each do |section|
        section["components"].each do |requirement_block|
          tip = customizations&.dig("requirement_block_changes", requirement_block["id"], "tip")
          block_id = requirement_block["id"]
          csv << [requirement_block["title"], tip, nil, nil, nil, nil, nil, nil]
          requirement_block["components"].each do |requirement|
            is_multi_contact = requirement["key"].ends_with?("multi_contact")
            component = is_multi_contact ? requirement["components"].first : requirement

            question = component["label"]
            requirement_code = component["key"].split("|")[is_multi_contact ? -3 : -1]
            input_type = component["type"]
            required = component.dig("validate", "required") || false
            is_elective = component["elective"] || false
            elective_enabled =
              customizations&.dig("requirement_block_changes", block_id, "enabled_elective_field_ids")&.include?(
                component["id"],
              ) || false
            elective_reason =
              customizations&.dig(
                "requirement_block_changes",
                block_id,
                "enabled_elective_field_reasons",
                component["id"],
              )
            csv << [
              nil,
              nil,
              question,
              requirement_code,
              input_type,
              required,
              is_elective,
              elective_enabled,
              elective_reason,
            ]
          end
        end
      end
    end
  end
end

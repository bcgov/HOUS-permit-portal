class AutomatedComplianceOptionsService
  AVAILABLE_MODULE_OPTIONS = {
    DigitalSealValidator: {
      module: "DigitalSealValidator",
      label: "Digital Seal Validator - Validates the digital seal of a file",
      default_settings: {
        "trigger" => "on_save",
        "value_on" => "compliance_data",
      },
      available_on_input_types: ["file"],
      type: :file_validator,
    },
    ParcelInfoExtractor: {
      module: "ParcelInfoExtractor",
      label: "Parcel Info Extractor - Extracts info from parcel information",
      type: :external_value_extractor,
      available_fields: [
        { value: "FEATURE_AREA_SQM", label: "Feature area (sqm)", available_on_input_types: %w[text number] },
        { value: "PID", label: "PID", available_on_input_types: %w[text] },
        { value: "PIN", label: "PIN", available_on_input_types: %w[text] },
        { value: "PLAN_NUMBER", label: "Plan number", available_on_input_types: %w[text] },
      ],
      available_on_input_types: %w[text number],
    },
    PermitApplication: {
      module: "PermitApplication",
      label: "Permit Application - Extracts info from permit application",
      type: :internal_value_extractor,
      available_fields: [{ value: "full_address", label: "Full address", available_on_input_types: %w[text] }],
      available_on_input_types: %w[text number],
    },
    # HistoricSite: {
    #   module: "HistoricSite",
    #   label: "Extracts info from historic site",
    #   type: :external_options_mapper,
    #   default_settings: {
    #     value: "HISTORIC_SITE_IND",
    #   },
    #   mappable_external_options: [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }],
    #   available_on_input_types: %w[select],
    # },
  }

  def self.available_module_options
    AVAILABLE_MODULE_OPTIONS
  end
end

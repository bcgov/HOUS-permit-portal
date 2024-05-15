class AutomatedComplianceConfigurationService
  attr_accessor :requirement

  AVAILABLE_MODULE_CONFIGURATIONS = {
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
  VALUE_EXTRACTION_TYPES = %i[external_value_extractor internal_value_extractor]

  def initialize(requirement)
    @requirement = requirement
  end

  def merge_default_settings!
    computed_compliance = requirement.computed_compliance

    return unless computed_compliance.present?

    module_name = computed_compliance["module"]

    return unless module_name.present?

    available_module_configuration = available_module_configurations[module_name.to_sym]

    return unless available_module_configuration.present?

    default_settings = available_module_configuration[:default_settings]

    return unless default_settings.present?

    computed_compliance.merge!(default_settings)
  end

  def valid_configuration?
    computed_compliance = requirement.computed_compliance

    return true unless computed_compliance.present?

    module_name = computed_compliance["module"]

    return false unless module_name.present?

    module_config = available_module_configurations[module_name.to_sym]

    return false unless module_config.present?

    return false unless valid_input_type?(module_config)

    if is_value_extraction_module_config?(module_config) &&
         !valid_extraction_field_value?(module_config, computed_compliance)
      return false
    end

    return true unless module_config[:default_settings].present?

    valid_default_settings?(module_config, computed_compliance)
  end

  def self.available_module_configurations
    AVAILABLE_MODULE_CONFIGURATIONS
  end

  private

  def available_module_configurations
    self.class.available_module_configurations
  end

  def valid_input_type?(module_config)
    available_on_input_types = module_config[:available_on_input_types]
    available_on_input_types.include?(requirement.input_type)
  end

  def is_value_extraction_module_config?(module_config)
    VALUE_EXTRACTION_TYPES.include?(module_config[:type])
  end

  def valid_extraction_field_value?(module_config, computed_compliance)
    available_fields = module_config[:available_fields]
    return false unless available_fields.present?

    field_value = computed_compliance["value"]

    available_fields.any? { |field| field[:value] == field_value }
  end

  def valid_default_settings?(module_config, computed_compliance)
    default_settings = module_config[:default_settings]
    default_settings.all? { |key, value| computed_compliance[key] == value }
  end
end

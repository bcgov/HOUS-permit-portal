class AutomatedComplianceConfigurationService
  attr_accessor :requirement

  AVAILABLE_MODULE_CONFIGURATIONS = {
    DigitalSealValidator: {
      module: "DigitalSealValidator",
      label: I18n.t("arbitrary_message_construct.auto_compliance_configuration.digital_seal_validator.label"),
      default_settings: {
        "trigger" => "on_save",
        "value_on" => "compliance_data",
      },
      available_on_input_types: ["file"],
      type: :file_validator,
    },
    ParcelInfoExtractor: {
      module: "ParcelInfoExtractor",
      label: I18n.t("arbitrary_message_construct.auto_compliance_configuration.parcel_info_extractor.label"),
      type: :external_value_extractor,
      available_fields: [
        {
          value: "FEATURE_AREA_SQM",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.parcel_info_extractor.available_field_labels.feature_area",
            ),
          available_on_input_types: %w[text number],
        },
        {
          value: "PID",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.parcel_info_extractor.available_field_labels.pid",
            ),
          available_on_input_types: %w[text],
        },
        {
          value: "PIN",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.parcel_info_extractor.available_field_labels.pin",
            ),
          available_on_input_types: %w[text],
        },
        {
          value: "PLAN_NUMBER",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.parcel_info_extractor.available_field_labels.plan_number",
            ),
          available_on_input_types: %w[text number],
        },
      ],
      available_on_input_types: %w[text],
    },
    PermitApplication: {
      module: "PermitApplication",
      label: I18n.t("arbitrary_message_construct.auto_compliance_configuration.permit_application.label"),
      type: :internal_value_extractor,
      available_fields: [
        {
          value: "full_address",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.permit_application.available_field_labels.full_address",
            ),
          available_on_input_types: %w[text],
        },
        {
          value: "pid",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.permit_application.available_field_labels.pid",
            ),
          available_on_input_types: %w[text],
        },
        {
          value: "pin",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.permit_application.available_field_labels.pin",
            ),
          available_on_input_types: %w[text],
        },
      ],
      available_on_input_types: %w[text],
    },
    HistoricSite: {
      module: "HistoricSite",
      label: I18n.t("arbitrary_message_construct.auto_compliance_configuration.historic_site.label"),
      type: :external_options_mapper,
      default_settings: {
        value: "HISTORIC_SITE_IND",
      },
      mappable_external_options: [
        {
          value: "Y",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.historic_site.mappable_external_option_labels.y",
            ),
        },
        {
          value: "N",
          label:
            I18n.t(
              "arbitrary_message_construct.auto_compliance_configuration.historic_site.mappable_external_option_labels.n",
            ),
        },
      ],
      available_on_input_types: %w[select],
    },
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

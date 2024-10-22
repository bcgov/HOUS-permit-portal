class AutomatedComplianceConfigurationService
  attr_accessor :requirement

  AVAILABLE_MODULE_CONFIGURATIONS = {
    DigitalSealValidator: {
      module: "DigitalSealValidator",
      label:
        I18n.t(
          "services.auto_compliance_configuration.digital_seal_validator.label"
        ),
      default_settings: {
        "trigger" => "on_save",
        "value_on" => "compliance_data"
      },
      available_on_input_types: ["file"],
      type: :file_validator
    },
    ParcelInfoExtractor: {
      module: "ParcelInfoExtractor",
      label:
        I18n.t(
          "services.auto_compliance_configuration.parcel_info_extractor.label"
        ),
      type: :external_value_extractor,
      available_fields: [
        {
          value: "FEATURE_AREA_SQM",
          label:
            I18n.t(
              "services.auto_compliance_configuration.parcel_info_extractor.available_field_labels.feature_area"
            ),
          available_on_input_types: %w[text number]
        },
        {
          value: "PID",
          label:
            I18n.t(
              "services.auto_compliance_configuration.parcel_info_extractor.available_field_labels.pid"
            ),
          available_on_input_types: %w[text]
        },
        {
          value: "PIN",
          label:
            I18n.t(
              "services.auto_compliance_configuration.parcel_info_extractor.available_field_labels.pin"
            ),
          available_on_input_types: %w[text]
        },
        {
          value: "PLAN_NUMBER",
          label:
            I18n.t(
              "services.auto_compliance_configuration.parcel_info_extractor.available_field_labels.plan_number"
            ),
          available_on_input_types: %w[text]
        }
      ],
      available_on_input_types: %w[text number]
    },
    PermitApplication: {
      module: "PermitApplication",
      label:
        I18n.t(
          "services.auto_compliance_configuration.permit_application.label"
        ),
      type: :internal_value_extractor,
      available_fields: [
        {
          value: "full_address",
          label:
            I18n.t(
              "services.auto_compliance_configuration.permit_application.available_field_labels.full_address"
            ),
          available_on_input_types: %w[text]
        },
        {
          value: "pid",
          label:
            I18n.t(
              "services.auto_compliance_configuration.permit_application.available_field_labels.pid"
            ),
          available_on_input_types: %w[text]
        },
        {
          value: "pin",
          label:
            I18n.t(
              "services.auto_compliance_configuration.permit_application.available_field_labels.pin"
            ),
          available_on_input_types: %w[text]
        }
      ],
      available_on_input_types: %w[text]
    },
    HistoricSite: {
      module: "HistoricSite",
      label:
        I18n.t("services.auto_compliance_configuration.historic_site.label"),
      type: :external_options_mapper,
      default_settings: {
        "value" => "HISTORIC_SITE_IND"
      },
      mappable_external_options: [
        {
          value: "Y",
          label:
            I18n.t(
              "services.auto_compliance_configuration.historic_site.mappable_external_option_labels.y"
            )
        },
        {
          value: "N",
          label:
            I18n.t(
              "services.auto_compliance_configuration.historic_site.mappable_external_option_labels.n"
            )
        }
      ],
      available_on_input_types: %w[select]
    }
  }
  VALUE_EXTRACTION_TYPES = %i[external_value_extractor internal_value_extractor]
  OPTIONS_MAPPER_TYPES = %i[external_options_mapper]

  def initialize(requirement)
    @requirement = requirement
  end

  def merge_default_settings!
    computed_compliance = requirement.computed_compliance

    return unless computed_compliance.present?

    module_name = computed_compliance["module"]

    return unless module_name.present?

    available_module_configuration =
      available_module_configurations[module_name.to_sym]

    return unless available_module_configuration.present?

    default_settings = available_module_configuration[:default_settings]

    return unless default_settings.present?

    computed_compliance.merge!(default_settings)
  end

  def validate_configuration
    validation_result = { error: nil }
    computed_compliance = requirement.computed_compliance

    return validation_result unless computed_compliance.present?

    module_name = computed_compliance["module"]

    unless module_name.present? &&
             available_module_configurations[module_name.to_sym].present?
      validation_result[:error] = I18n.t(
        "services.auto_compliance_configuration.validation_errors.incorrect_computed_compliance_module",
        accepted_values: self.class.available_module_names.join(", ")
      )
      return validation_result
    end

    module_config = available_module_configurations[module_name.to_sym]

    unless valid_input_type?(module_config)
      validation_result[:error] = I18n.t(
        "services.auto_compliance_configuration.validation_errors.incompatible_input_type_for_module",
        module_name: module_name,
        input_type: requirement.input_type
      )
      return validation_result
    end

    if is_value_extraction_module_config?(module_config) &&
         !valid_extraction_field_value?(module_config, computed_compliance)
      validation_result[:error] = I18n.t(
        "services.auto_compliance_configuration.validation_errors.incorrect_value_extraction_field",
        module_name: module_name
      )
      return validation_result
    end

    if is_options_mapper_module_config?(module_config) &&
         !valid_options_map?(module_config, computed_compliance)
      validation_result[:error] = I18n.t(
        "services.auto_compliance_configuration.validation_errors.incorrect_options_map",
        module_name: module_name
      )
      return validation_result
    end

    return validation_result unless module_config[:default_settings].present?

    unless valid_default_settings?(module_config, computed_compliance)
      validation_result[:error] = I18n.t(
        "services.auto_compliance_configuration.validation_errors.default_settings_not_valid",
        module_name: module_name
      )
    end

    validation_result
  end

  def self.available_module_configurations
    AVAILABLE_MODULE_CONFIGURATIONS
  end

  def self.available_module_names
    AVAILABLE_MODULE_CONFIGURATIONS.keys
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

  def is_options_mapper_module_config?(module_config)
    OPTIONS_MAPPER_TYPES.include?(module_config[:type])
  end

  def valid_extraction_field_value?(module_config, computed_compliance)
    available_fields = module_config[:available_fields]
    return false unless available_fields.present?

    field_value = computed_compliance["value"]

    return false unless field_value.present?

    available_fields.any? { |field| field[:value] == field_value }
  end

  def valid_options_map?(module_config, computed_compliance)
    mappable_external_options = module_config[:mappable_external_options]

    return false unless mappable_external_options.present?

    options_map = computed_compliance["options_map"]
    value_options = requirement.value_options

    unless value_options.present? && value_options.is_a?(Array) &&
             !value_options.empty?
      return false
    end

    unless options_map.present? && options_map.is_a?(Hash) &&
             !options_map.empty?
      return false
    end

    is_valid_options_map =
      options_map.all? do |external_option_value, requirement_option_value|
        external_option_valid =
          mappable_external_options.any? do |option|
            option[:value] == external_option_value
          end
        requirement_option_valid =
          value_options.any? do |option|
            option["value"] == requirement_option_value
          end

        external_option_valid && requirement_option_valid
      end

    is_valid_options_map
  end

  def valid_default_settings?(module_config, computed_compliance)
    default_settings = module_config[:default_settings]
    default_settings.all? { |key, value| computed_compliance[key] == value }
  end
end

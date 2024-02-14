class Requirement < ApplicationRecord
  belongs_to :requirement_block

  acts_as_list scope: :requirement_block, top_of_list: 0

  enum input_type: {
         text: 0,
         number: 1,
         checkbox: 2,
         select: 3,
         multi_option_select: 4,
         date: 5,
         textarea: 6,
         file: 7,
         phone: 10,
         email: 11,
         radio: 12,
         address: 13,
         bcaddress: 14,
         signature: 15,
       },
       _prefix: true

  before_create :set_requirement_code
  validate :validate_value_options
  validate :validate_unit_for_number_inputs

  DEFAULT_FORMIO_TYPE_TO_OPTIONS = {
    text: {
      type: "simpletextfield",
    },
    phone: {
      type: "simplephonenumber",
    },
    email: {
      type: "simpleemail",
    },
    address: {
      type: "simpleaddressadvanced",
    },
    bcaddress: {
      type: "bcaddress",
    },
    signature: {
      type: "simplesignatureadvanced",
    },
    number: {
      applyMaskOn: "change",
      mask: false,
      inputFormat: "plain",
    },
    date: {
      enableTime: false,
      datePicker: {
        disableWeekends: false,
        disableWeekdays: false,
      },
      enableMinDateInput: false,
      enableMaxDateInput: false,
      widget: {
        type: "calendar",
        displayInTimezone: "viewer",
        locale: "en",
        useLocaleSettings: false,
        allowInput: true,
        mode: "single",
        enableTime: true,
        noCalendar: false,
        format: "yyyy-MM-dd",
        hourIncrement: 1,
        minuteIncrement: 1,
        time_24hr: false,
        minDate: nil,
        disableWeekends: false,
        disableWeekdays: false,
        maxDate: nil,
      },
    },
    select: {
      widget: {
        type: "choicesjs",
      },
    },
    multi_option_select: {
      type: "select",
      multiple: true,
      widget: {
        type: "choicesjs",
      },
    },
  }

  NUMBER_UNITS = %w[no_unit mm cm m in ft mi $ sqm sqft]
  TYPES_WITH_VALUE_OPTIONS = %w[multi_option_select select checkbox radio]

  def value_options
    return nil if input_options.blank? || input_options["value_options"].blank?

    input_options["value_options"]
  end

  def number_unit
    return nil if input_options.blank? || input_options["number_unit"].blank?

    input_options["number_unit"]
  end

  def key(requirement_block_key)
    "#{requirement_block_key}|#{requirement_code}"
  end

  def to_form_json(requirement_block_key = requirement_block&.key)
    json = {
      id: id,
      key: key(requirement_block_key),
      type: input_type,
      input: true,
      label: label,
      widget: {
        type: "input",
      },
    }.merge!(formio_type_options)

    if input_type_select? || input_type_multi_option_select?
      json.merge!({ data: { values: input_options["value_options"] } })
    end

    if input_options["computed_compliance"].present?
      json.merge!({ computedCompliance: input_options["computed_compliance"] })
    end

    json
  end

  private

  # requirement codes should not be auto generated during seeding.  Use uuid if not provided
  def set_requirement_code
    self.requirement_code ||=
      (
        if label.present?
          label.parameterize.underscore.camelize(:lower)
        else
          SecureRandom.uuid
        end
      )
  end

  def formio_type_options
    if (input_type.to_sym == :file)
      return(
        {
          type: "file",
          storage:
            (
              if (!Rails.env.test? && ENV["BCGOV_OBJECT_STORAGE_ACCESS_KEY_ID"].present?)
                "s3custom"
              else
                nil
              end
            ),
        }.tap do |file_hash|
          file_hash["computedCompliance"] = input_options["computed_compliance"] if input_options[
            "computed_compliance"
          ].present?
          file_hash["multiple"] = true if input_options["multiple"].present?
        end
      )
    end
    DEFAULT_FORMIO_TYPE_TO_OPTIONS[input_type.to_sym] || {}
  end

  def validate_value_options
    return unless TYPES_WITH_VALUE_OPTIONS.include?(input_type.to_s)

    if input_options.blank? || input_options["value_options"].blank? || !input_options["value_options"].is_a?(Array) ||
         !input_options["value_options"].all? { |option|
           option.is_a?(Hash) && (option.key?("label") && option["label"].is_a?(String)) &&
             (option.key?("value") && option["value"].is_a?(String))
         }
      errors.add(:input_options, "must have value options defined")
    end
  end

  def validate_unit_for_number_inputs
    return unless input_type_number? && (input_options.present? && input_options["number_unit"].present?)

    if !NUMBER_UNITS.include?(input_options["number_unit"])
      errors.add(:input_options, "the number_unit must be one of #{NUMBER_UNITS.join(", ")}")
    end
  end
end

class Requirement < ApplicationRecord
  has_many :requirement_block_requirements, dependent: :destroy
  has_many :requirement_blocks, through: :requirement_block_requirements

  enum input_type: {
         text: 0,
         number: 1,
         checkbox: 2,
         select: 3,
         multi_option_select: 4,
         date: 5,
         textarea: 6,
       },
       _prefix: true

  before_create :set_requirement_code
  validate :validate_options_for_select_inputs

  DEFAULT_FORMIO_TYPE_TO_OPTIONS = {
    text: {
      type: "simpletextfield",
    },
    number: {
      applyMaskOn: "change",
      mask: false,
      inputFormat: "plain",
    },
    multi_option_select: {
      type: "select",
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

  def value_options
    return nil if input_options.blank? || input_options["value_options"].blank?

    input_options["value_options"]
  end

  def to_form_json
    json = {
      id: reusable ? SecureRandom.uuid : id,
      key: label.parameterize.underscore.camelize(:lower),
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

    json
  end

  private

  # requirement codes should not be auto generated during seeding.  Use uuid if not provided
  def set_requirement_code
    self.requirement_code ||= SecureRandom.uuid
  end

  def formio_type_options
    DEFAULT_FORMIO_TYPE_TO_OPTIONS[input_type.to_sym] || {}
  end

  def validate_options_for_select_inputs
    return unless input_type_select? || input_type_multi_option_select?

    if input_options.blank? || input_options["value_options"].blank? || !input_options["value_options"].is_a?(Array) ||
         !input_options["value_options"].all? { |option|
           option.is_a?(Hash) && (option.key?("label") && option["label"].is_a?(String)) &&
             (option.key?("value") && option["value"].is_a?(String))
         }
      errors.add(:input_options, "select inputs must have options defined")
    end
  end
end

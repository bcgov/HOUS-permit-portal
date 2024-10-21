class RequirementFormJsonService
  attr_accessor :requirement

  DEFAULT_FORMIO_TYPE_TO_OPTIONS = {
    text: {
      type: "simpletextfield"
    },
    phone: {
      type: "simplephonenumber"
    },
    email: {
      type: "simpleemail"
    },
    # TODO: figure out why these address fields don't work
    # address: {
    #   type: "simpleaddressadvanced",
    # },
    address: {
      type: "simpletextfield"
    },
    bcaddress: {
      type: "bcaddress"
    },
    signature: {
      type: "simplesignatureadvanced"
    },
    number: {
      delimiter: true,
      applyMaskOn: "change",
      mask: false,
      inputFormat: "plain"
    },
    date: {
      tableView: false,
      enableTime: false,
      datePicker: {
        disableWeekends: false,
        disableWeekdays: false
      },
      enableMinDateInput: false,
      enableMaxDateInput: false,
      type: "datetime",
      input: true,
      widget: {
        type: "calendar",
        displayInTimezone: "viewer",
        locale: "en",
        useLocaleSettings: false,
        allowInput: true,
        mode: "single",
        enableTime: false,
        noCalendar: false,
        format: "yyyy-MM-dd",
        hourIncrement: 1,
        minuteIncrement: 1,
        time_24hr: false,
        minDate: nil,
        disableWeekends: false,
        disableWeekdays: false,
        maxDate: nil
      }
    },
    select: {
      widget: {
        type: "choicesjs"
      }
    },
    multi_option_select: {
      type: "selectboxes",
      inputType: "checkbox",
      optionsLabelPosition: "right",
      tableView: false
      # type: "select",
      # multiple: true,
      # widget: {
      #   type: "choicesjs",
      # },
    },
    energy_step_code: {
      type: "button",
      action: "custom",
      title: I18n.t("formio.requirement_template.energy_step_code"),
      label: I18n.t("formio.requirement_template.energy_step_code"),
      custom: "document.dispatchEvent(new Event('openStepCode'));"
    }
  }

  def initialize(requirement)
    self.requirement = requirement
  end

  def to_form_json(requirement_block_key = requirement&.requirement_block&.key)
    json =
      if requirement.input_type_general_contact? ||
           requirement.input_type_professional_contact?
        get_contact_form_json(requirement_block_key)
      elsif requirement.input_type_pid_info?
        get_pid_info_components(requirement_block_key, requirement.required)
      else
        {
          id: requirement.id,
          key: requirement.key(requirement_block_key),
          type: requirement.input_type,
          requirementInputType: requirement.input_type,
          input: true,
          label: requirement.label,
          widget: {
            type: "input"
          }
        }.merge!(formio_type_options)
      end

    json.merge!({ description: requirement.hint }) if requirement.hint

    json.merge!({ validate: { required: true } }) if requirement.required

    # assume all electives use a customConditional that defaults to false.  The customConditional works in tandem with the conditionals
    json.merge!({ elective: requirement.elective }) if requirement.elective

    if requirement.input_type_select?
      json.merge!(
        { data: { values: requirement.input_options["value_options"] } }
      )
    end

    if requirement.input_type_multi_option_select? ||
         requirement.input_type_radio?
      json.merge!({ values: requirement.input_options["value_options"] })
    end

    if requirement.computed_compliance?
      json.merge!(
        { computedCompliance: requirement.input_options["computed_compliance"] }
      )
    end

    if requirement.input_type.to_sym == :energy_step_code
      json.merge!(
        { energyStepCode: requirement.input_options["energy_step_code"] }
      )
    end

    if requirement.input_options["conditional"].present?
      # assumption that conditional is only within the same requirement block for now
      conditional = requirement.input_options["conditional"].clone
      section = PermitApplication.section_from_key(requirement_block_key)
      if conditional["when"].present?
        conditional.merge!(
          "when" => "#{section}.#{requirement_block_key}|#{conditional["when"]}"
        )
      end
      json.merge!({ conditional: conditional })
    end

    # indicates code-based conditionals.  Always merge elective show = false to end.
    if requirement.input_options["customConditional"].present?
      json.merge!(
        { customConditional: requirement.input_options["customConditional"] }
      )
    end
    if requirement.elective
      json.merge!(
        { customConditional: "#{json[:customConditional]};show = false" }
      )
    end

    json
  end

  private

  def get_contact_form_json(
    requirement_block_key = requirement&.requirement_block&.key
  )
    unless requirement.input_type_general_contact? ||
             requirement.input_type_professional_contact?
      return {}
    end

    if requirement.input_options["can_add_multiple_contacts"].blank?
      return(
        get_contact_field_set_form_json(
          "#{requirement.key(requirement_block_key)}|#{requirement.input_type}",
          false
        )
      )
    end

    get_multi_contact_datagrid_form_json(requirement_block_key)
  end

  def get_contact_field_form_json(field_type, parent_key = nil, required = true)
    # The key needs to be camel case, otherwise there are issues in the front-end with data-grid
    key = snake_to_camel(field_type.to_s)
    key = "#{parent_key}|#{key}" if parent_key.present?

    shared_form_json = {
      applyMaskOn: "change",
      tableView: true,
      input: true,
      key: key,
      label: I18n.t("formio.requirement.contact.#{field_type.to_s}"),
      type: "textfield",
      validate: {
        required: required
      },
      **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:text]
    }

    # TODO: address is a text now, replace with address type when implemented
    field_to_form_json = {
      email: {
        **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:email]
      },
      phone: {
        **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:phone]
      }
    }

    form_json =
      (
        if field_to_form_json[field_type].present?
          shared_form_json.merge!(field_to_form_json[field_type])
        else
          shared_form_json
        end
      )

    form_json
  end

  def get_columns_form_json(key, column_components = [])
    {
      label: "Columns",
      columns: column_components.map { |item| { components: [item] } },
      key: key,
      type: "columns",
      input: false,
      tableView: false
    }
  end

  def get_contact_field_set_form_json(key, is_multi)
    unless requirement.input_type_general_contact? ||
             requirement.input_type_professional_contact?
      return {}
    end

    contact_components =
      (
        if requirement.input_type_general_contact?
          get_general_contact_field_components(key)
        else
          get_professional_contact_field_components(key)
        end
      )

    form_json = {
      legend: requirement.label,
      key: key,
      type: "fieldset",
      custom_class: "contact-field-set",
      label: requirement.label,
      hideLabel: true,
      input: false,
      tableView: false,
      components:
        contact_components.unshift(
          get_autofill_contact_button_form_json(key, is_multi)
        )
    }

    form_json[:id] = requirement.id if requirement.input_options[
      "can_add_multiple_contacts"
    ].blank?

    form_json
  end

  def get_general_contact_field_components(parent_key = nil)
    required = self.requirement.required
    [
      get_columns_form_json(
        "name_columns",
        [
          get_contact_field_form_json(:first_name, parent_key, required),
          get_contact_field_form_json(:last_name, parent_key, required)
        ]
      ),
      get_columns_form_json(
        "reach_columns",
        [
          get_contact_field_form_json(:email, parent_key, required),
          get_contact_field_form_json(:phone, parent_key, required)
        ]
      ),
      get_contact_field_form_json(:address, parent_key, required),
      get_columns_form_json(
        "organization_columns",
        [
          get_contact_field_form_json(:organization, parent_key, false),
          get_contact_field_form_json(:title, parent_key, required)
        ]
      )
    ]
  end

  def get_professional_contact_field_components(parent_key = nil)
    required = self.requirement.required
    [
      get_columns_form_json(
        "name_columns",
        [
          get_contact_field_form_json(:first_name, parent_key, required),
          get_contact_field_form_json(:last_name, parent_key, required)
        ]
      ),
      get_columns_form_json(
        "reach_columns",
        [
          get_contact_field_form_json(:email, parent_key, required),
          get_contact_field_form_json(:phone, parent_key, required)
        ]
      ),
      get_contact_field_form_json(:address, parent_key, required),
      get_contact_field_form_json(:title, parent_key, required),
      get_columns_form_json(
        "business_columns",
        [
          get_contact_field_form_json(:business_name, parent_key, false),
          get_contact_field_form_json(:business_license, parent_key, false)
        ]
      ),
      get_columns_form_json(
        "professional_columns",
        [
          get_contact_field_form_json(
            :professional_association,
            parent_key,
            false
          ),
          get_contact_field_form_json(:professional_number, parent_key, false)
        ]
      )
    ]
  end

  def get_autofill_contact_button_form_json(parent_key, is_multi)
    {
      type: "button",
      action: "custom",
      custom_class: "autofill-button",
      title: I18n.t("formio.requirement_template.autofill_contact"),
      label: I18n.t("formio.requirement_template.autofill_contact"),
      custom:
        "document.dispatchEvent(new CustomEvent('openAutofillContact', { detail: { key: `#{parent_key}|#{is_multi ? "${rowIndex}" : "in_section"}` } } ));"
    }
  end

  def get_multi_contact_datagrid_form_json(
    requirement_block_key = requirement&.requirement_block&.key
  )
    unless requirement.input_type_general_contact? ||
             requirement.input_type_professional_contact?
      return {}
    end

    key = "#{requirement.key(requirement_block_key)}|multi_contact"
    {
      label: requirement.label,
      id: requirement.id,
      reorder: false,
      addAnother: I18n.t("formio.requirement.contact.add_person_button"),
      addAnotherPosition: "bottom",
      layoutFixed: false,
      enableRowGroups: false,
      initEmpty: false,
      hideLabel: true,
      tableView: false,
      custom_class: "contact-data-grid",
      key: key,
      type: "datagrid",
      input: false,
      components: [
        get_contact_field_set_form_json(
          "#{key}|#{requirement.input_type}",
          true
        )
      ]
    }
  end

  def get_nested_info_component(
    field_key,
    parent_key,
    label,
    required,
    field_type = nil
  )
    key = snake_to_camel(field_key.to_s)
    key = "#{parent_key}|#{key}" if parent_key.present?

    if field_type.present?
      raise Error if DEFAULT_FORMIO_TYPE_TO_OPTIONS[field_type.to_sym].blank?
      {
        key: key,
        type: field_type,
        requirementInputType: field_type,
        tableView: true,
        input: true,
        label: label,
        widget: {
          type: "input"
        },
        validate: {
          required: required
        }
      }.merge!(DEFAULT_FORMIO_TYPE_TO_OPTIONS[field_type.to_sym])
    else
      {
        applyMaskOn: "change",
        tableView: true,
        input: true,
        key: key,
        label: label,
        type: "textfield",
        validate: {
          required: required
        },
        **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:text]
      }
    end
  end

  def get_pid_info_components(
    requirement_block_key = requirement&.requirement_block&.key,
    required = false
  )
    return {} unless requirement.input_type_pid_info?
    key = "#{requirement.key(requirement_block_key)}|additional_pid_info"
    component = {
      legend: requirement.label,
      key: key,
      type: "fieldset",
      custom_class: "multi-field-set",
      label: requirement.label,
      hideLabel: true,
      input: false,
      tableView: false,
      components: [
        get_columns_form_json(
          "pid_entry_columns",
          [
            get_nested_info_component(
              :pid,
              requirement_block_key,
              "PID",
              required
            ),
            get_nested_info_component(
              :folio_number,
              requirement_block_key,
              "Folio Number",
              false
            )
          ]
        ),
        get_nested_info_component(
          :address,
          requirement_block_key,
          "Address",
          false,
          :address
        )
      ]
    }
    multi_data_grid_form_json(key, component, true, "Add #{requirement.label}")
  end

  # this is a generic mulitgrid for a single component
  def multi_data_grid_form_json(
    override_key,
    component,
    initEmpty = true,
    addMoreText = I18n.t("formio.requirement.multi_grid.default_add")
  )
    {
      label: requirement.label,
      id: requirement.id,
      reorder: false,
      addAnother: addMoreText,
      addAnotherPosition: "bottom",
      layoutFixed: false,
      enableRowGroups: false,
      initEmpty: initEmpty,
      hideLabel: true,
      tableView: false,
      custom_class: "multi-data-grid",
      key: override_key,
      type: "datagrid",
      input: false,
      components: [component]
    }
  end

  def formio_type_options
    return unless requirement.input_type.present?

    input_type = requirement.input_type
    input_options = requirement.input_options

    if (input_type.to_sym == :file)
      return(
        {
          type: "simplefile",
          storage: "s3custom"
          # fileMaxSize driven by front end defaults, do not set in requirements as it fixes it
        }.tap do |file_hash|
          file_hash[:computedCompliance] = input_options[
            "computed_compliance"
          ] if input_options["computed_compliance"].present?
          file_hash[:multiple] = true if input_options["multiple"].present?
          file_hash[:custom_class] = "formio-component-file" if file_hash[
            :type
          ] != "file"
        end
      )
    end
    DEFAULT_FORMIO_TYPE_TO_OPTIONS[input_type.to_sym] || {}
  end

  def snake_to_camel(snake_str)
    components = snake_str.split("_")
    # capitalize the first letter of each component except the first
    components[0] + components[1..-1].map(&:capitalize).join
  end
end

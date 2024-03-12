class RequirementFormJsonService
  attr_accessor :requirement

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
    # TODO: figure out why these address fields don't work
    # address: {
    #   type: "simpleaddressadvanced",
    # },
    address: {
      type: "simpletextfield",
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
      type: "selectboxes",
      inputType: "checkbox",
      optionsLabelPosition: "right",
      tableView: false,
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
      custom: "document.dispatchEvent(new Event('openStepCode'));",
    },
  }

  def initialize(requirement)
    self.requirement = requirement
  end

  def to_form_json(requirement_block_key = requirement&.requirement_block&.key)
    json =
      if requirement.input_type_general_contact? || requirement.input_type_professional_contact?
        get_contact_form_json(requirement_block_key)
      else
        {
          id: requirement.id,
          key: requirement.key(requirement_block_key),
          type: requirement.input_type,
          input: true,
          label: requirement.label,
          widget: {
            type: "input",
          },
        }.merge!(formio_type_options)
      end

    json.merge!({ description: requirement.hint }) if requirement.hint

    json.merge!({ validate: { required: true } }) if requirement.required

    # assume all electives use a customConditional that defaults to false.  The customConditional works in tandem with the conditionals
    json.merge!({ elective: requirement.elective }) if requirement.elective

    json.merge!({ data: { values: requirement.input_options["value_options"] } }) if requirement.input_type_select?

    json.merge!({ values: requirement.input_options["value_options"] }) if requirement.input_type_multi_option_select?

    if requirement.computed_compliance?
      json.merge!({ computedCompliance: requirement.input_options["computed_compliance"] })
    end

    if requirement.input_type.to_sym == :energy_step_code
      json.merge!({ energyStepCode: requirement.input_options["energy_step_code"] })
    end

    if requirement.input_options["conditional"].present?
      # assumption that conditional is only within the same requirement block for now
      conditional = requirement.input_options["conditional"]
      section = PermitApplication.section_from_key(requirement_block_key)
      if conditional["when"].present?
        conditional.merge!("when" => "#{section}.#{requirement_block_key}|#{conditional["when"]}")
      end
      json.merge!({ conditional: conditional })
    end

    # indicates code-based conditionals.  Always merge elective show = false to end.
    if requirement.input_options["customConditional"].present?
      json.merge!({ customConditional: requirement.input_options["customConditional"] })
    end
    json.merge!({ customConditional: "#{json[:customConditional]};show = false" }) if requirement.elective

    json
  end

  private

  def get_contact_form_json(requirement_block_key = requirement&.requirement_block&.key)
    return {} unless requirement.input_type_general_contact? || requirement.input_type_professional_contact?

    if requirement.input_options["can_add_multiple_contacts"].blank?
      return(get_contact_field_set_form_json(requirement.key(requirement_block_key)))
    end

    get_multi_contact_datagrid_form_json(requirement_block_key)
  end

  def get_contact_field_form_json(field_key)
    shared_form_json = {
      applyMaskOn: "change",
      tableView: true,
      input: true,
      # THe key needs to be camel case, otherwise there are issues in the front-end with data-grid
      key: snake_to_camel(field_key.to_s),
      label: I18n.t("formio.requirement.contact.#{field_key.to_s}"),
      type: "textfield",
      **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:text],
    }

    # TODO: address is a text now, replace with address type when implemented
    field_to_form_json = {
      email: {
        **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:email],
      },
      phone: {
        **DEFAULT_FORMIO_TYPE_TO_OPTIONS[:phone],
      },
    }

    form_json =
      (
        if field_to_form_json[field_key].present?
          shared_form_json.merge!(field_to_form_json[field_key])
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
      tableView: false,
    }
  end

  def get_contact_field_set_form_json(key = nil)
    return {} unless requirement.input_type_general_contact? || requirement.input_type_professional_contact?

    key = requirement.input_type if key.nil?

    contact_components =
      (
        if requirement.input_type_general_contact?
          get_general_contact_field_components
        else
          get_professional_contact_field_components
        end
      )

    {
      legend: requirement.label,
      key: key,
      type: "fieldset",
      custom_class: "contact-field-set",
      label: requirement.label,
      hideLabel: true,
      input: false,
      tableView: false,
      components: contact_components,
    }
  end

  def get_general_contact_field_components()
    [
      get_columns_form_json(
        "name_columns",
        [get_contact_field_form_json(:first_name), get_contact_field_form_json(:last_name)],
      ),
      get_columns_form_json(
        "reach_columns",
        [get_contact_field_form_json(:email), get_contact_field_form_json(:phone)],
      ),
      get_contact_field_form_json(:address),
      get_columns_form_json("organization_columns", [get_contact_field_form_json(:organization)]),
    ]
  end

  def get_professional_contact_field_components
    [
      get_columns_form_json(
        "name_columns",
        [get_contact_field_form_json(:first_name), get_contact_field_form_json(:last_name)],
      ),
      get_columns_form_json(
        "reach_columns",
        [get_contact_field_form_json(:email), get_contact_field_form_json(:phone)],
      ),
      get_contact_field_form_json(:address),
      get_columns_form_json(
        "business_columns",
        [get_contact_field_form_json(:business_name), get_contact_field_form_json(:business_license)],
      ),
      get_columns_form_json(
        "professional_columns",
        [get_contact_field_form_json(:professional_association), get_contact_field_form_json(:professional_number)],
      ),
    ]
  end

  def get_multi_contact_datagrid_form_json(requirement_block_key = requirement&.requirement_block&.key)
    return {} unless requirement.input_type_general_contact? || requirement.input_type_professional_contact?

    {
      label: "Multi Contact",
      reorder: false,
      addAnother: I18n.t("formio.requirement.contact.add_person_button"),
      addAnotherPosition: "bottom",
      layoutFixed: false,
      enableRowGroups: false,
      initEmpty: false,
      hideLabel: true,
      tableView: false,
      custom_class: "contact-data-grid",
      defaultValue: [
        {
          firstName: "",
          email: "",
          lastName: "",
          phone: "",
          address: "", # TODO: address is a text now, replace with address type when implemented
          businessName: "",
          businessLicense: "",
          organization: "",
          professionalAssociation: "",
          professionalNumber: "",
        },
      ],
      key: requirement.key(requirement_block_key),
      type: "datagrid",
      input: true,
      components: [get_contact_field_set_form_json],
    }
  end

  def formio_type_options
    return unless requirement.input_type.present?

    input_type = requirement.input_type
    input_options = requirement.input_options

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

  def snake_to_camel(snake_str)
    components = snake_str.split("_")
    # capitalize the first letter of each component except the first
    components[0] + components[1..-1].map(&:capitalize).join
  end
end
require "digest"
require "json"

class RequirementFormJsonService
  attr_accessor :requirement

  ENERGY_STEP_CODE_TOOLTIP_URL =
    "https://www2.gov.bc.ca/gov/content?id=C4F8CA77AC5648CBB86948C1AEA58C8F#Reports"

  STEP_CODE_ACTIONS_CONTAINER =
    lambda do |start_event, step_code_type|
      {
        type: "container",
        input: false,
        tableView: false,
        components: [
          {
            type: "columns",
            input: false,
            tableView: false,
            columns: [
              {
                components: [
                  {
                    type: "button",
                    action: "custom",
                    title:
                      I18n.t("formio.requirement_template.energy_step_code"),
                    label:
                      I18n.t("formio.requirement_template.energy_step_code"),
                    custom:
                      "document.dispatchEvent(new Event('#{start_event}'));"
                  }
                ],
                width: 3,
                offset: 0,
                push: 0,
                pull: 0,
                size: "md"
              },
              {
                components: [
                  {
                    type: "content",
                    html:
                      "<span class=\"step-code-actions-inline\">#{I18n.t("formio.requirement_template.started_report_outside")} </span>"
                  },
                  {
                    type: "button",
                    action: "custom",
                    custom_class: "step-code-link-button",
                    title:
                      I18n.t(
                        "formio.requirement_template.select_energy_step_code"
                      ),
                    label:
                      I18n.t(
                        "formio.requirement_template.select_energy_step_code"
                      ),
                    custom:
                      "document.dispatchEvent(new CustomEvent('openExistingStepCode', { detail: { stepCodeType: '#{step_code_type}' } }));"
                  }
                ],
                width: 9,
                offset: 0,
                push: 0,
                pull: 0,
                size: "md"
              }
            ]
          }
        ]
      }
    end

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
    address: {
      type: "simpleaddressadvanced",
      provider: "nominatim",
      validate: {
        isUseForCopy: false
      },
      tableView: false,
      components: [
        {
          key: "address1",
          type: "textfield",
          input: true,
          label: "Address 1",
          tableView: false,
          customConditional:
            "show = _.get(instance, 'parent.manualMode', false);"
        },
        {
          key: "address2",
          type: "textfield",
          input: true,
          label: "Address 2",
          tableView: false,
          customConditional:
            "show = _.get(instance, 'parent.manualMode', false);"
        },
        {
          key: "city",
          type: "textfield",
          input: true,
          label: "City",
          tableView: false,
          customConditional:
            "show = _.get(instance, 'parent.manualMode', false);"
        },
        {
          key: "state",
          type: "textfield",
          input: true,
          label: "Province / State",
          tableView: false,
          customConditional:
            "show = _.get(instance, 'parent.manualMode', false);"
        },
        {
          key: "country",
          type: "textfield",
          input: true,
          label: "Country",
          tableView: false,
          customConditional:
            "show = _.get(instance, 'parent.manualMode', false);"
        },
        {
          key: "zip",
          type: "textfield",
          input: true,
          label: "Postal / Zip Code",
          tableView: false,
          customConditional:
            "show = _.get(instance, 'parent.manualMode', false);"
        }
      ]
    },
    bcaddress: {
      type: "simplebcaddress",
      provider: "custom",
      tableView: false,
      providerOptions: {
        url: "/api/geocoder/form_bc_addresses",
        params: {
          # echo: true,
          brief: true,
          # minScore: 55,
          # onlyCivic: true,
          maxResults: 10,
          autoComplete: true
          # matchAccuracy: 100,
          # matchPrecision: "unit, civic_number, intersection, block, street, locality, province"
          # precisionPoints: 100
        },
        queryProperty: "addressString",
        responseProperty: "features",
        displayValueProperty: "properties.fullAddress"
      },
      queryParameters: {
        # echo: true,
        brief: true,
        # minScore: 55,
        # onlyCivic: true,
        maxResults: 10,
        autoComplete: true
        # matchAccuracy: 100,
        # matchPrecision:  "unit, civic_number, intersection, block, street, locality, province"
        # precisionPoints: 100
      }
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
    energy_step_code:
      STEP_CODE_ACTIONS_CONTAINER.call("openStepCode", "Part9StepCode"),
    energy_step_code_part_3:
      STEP_CODE_ACTIONS_CONTAINER.call("openStepCodePart3", "Part3StepCode"),
    architectural_drawing: {
      type: "button",
      action: "custom",
      title: I18n.t("formio.requirement_template.architectural_drawing"),
      label: I18n.t("formio.requirement_template.architectural_drawing"),
      custom:
        "document.dispatchEvent(new CustomEvent('openArchitecturalDrawingTool', { detail: { requirementCode: component.key } }));"
    }
  }

  def initialize(requirement)
    self.requirement = requirement
  end

  def to_form_json(requirement_block_key = requirement&.requirement_block&.key)
    return nil unless requirement&.input_type.present?
    json =
      if requirement.input_type_general_contact? ||
           requirement.input_type_professional_contact?
        get_contact_form_json(requirement_block_key)
      elsif requirement.input_type_pid_info?
        get_pid_info_components(requirement_block_key, requirement.required)
      elsif requirement.input_type_multiply_sum_grid?
        get_multiply_sum_grid_form_json(requirement_block_key)
      elsif requirement.input_type_architectural_drawing?
        get_architectural_drawing_form_json(requirement_block_key)
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
    if requirement.instructions
      json.merge!({ instructions: requirement.instructions })
    end

    json.merge!({ validate: { required: true } }) if requirement.required

    if requirement.input_options["data_validation"].present?
      data_validation = requirement.input_options["data_validation"]
      validate_json = json[:validate] || {}

      if data_validation["operation"] == "min"
        validate_json[:min] = data_validation["value"].to_f
      elsif data_validation["operation"] == "max"
        validate_json[:max] = data_validation["value"].to_f
      end

      if data_validation["error_message"].present?
        validate_json[:customMessage] = data_validation["error_message"]
      end

      json[:validate] = validate_json
    end

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

      unless json[:tooltip].present?
        json.merge!(
          { tooltip: I18n.t("formio.requirement.auto_compliance.tooltip") }
        )
      end
    end

    if requirement.input_type.to_sym == :energy_step_code
      json.merge!(
        { energyStepCode: requirement.input_options["energy_step_code"] }
      )
      # Inject the requirement key into the link below the primary button
      inject_step_code_existing_link!(json, "Part9StepCode", json[:key])
    end

    if requirement.input_type.to_sym == :energy_step_code_part_3
      # Inject the requirement key into the link below the primary button
      inject_step_code_existing_link!(json, "Part3StepCode", json[:key])
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
      validate: {
        required: required
      },
      **(
        DEFAULT_FORMIO_TYPE_TO_OPTIONS[field_type] ||
          DEFAULT_FORMIO_TYPE_TO_OPTIONS[:text]
      )
    }

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
      get_contact_type_component(
        parent_key,
        true,
        get_general_contact_type_options
      ),
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
      get_contact_type_component(
        parent_key,
        true,
        get_professional_contact_type_options
      ),
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
      get_contact_field_form_json(:professional_association, parent_key, false),
      get_contact_field_form_json(:professional_number, parent_key, false)
    ]
  end

  def get_autofill_contact_button_form_json(parent_key, is_multi)
    # NOTE: parent_key is interpolated into a template literal, so we escape it.
    # is_multi is boolean, so safe.
    {
      type: "button",
      action: "custom",
      custom_class: "autofill-button",
      title: I18n.t("formio.requirement_template.autofill_contact"),
      label: I18n.t("formio.requirement_template.autofill_contact"),
      custom:
        "document.dispatchEvent(new CustomEvent('openAutofillContact', { detail: { key: `#{escape_for_js(parent_key)}|#{is_multi ? "${rowIndex}" : "in_section"}` } } ));"
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
    field_type = nil,
    computed_compliance = nil
  )
    key = snake_to_camel(field_key.to_s)
    key = "#{parent_key}|#{key}" if parent_key.present?

    component =
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

    if computed_compliance.present?
      component.merge!({ computedCompliance: computed_compliance })
      unless component[:tooltip].present?
        component.merge!(
          { tooltip: I18n.t("formio.requirement.auto_compliance.tooltip") }
        )
      end
    end

    component
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
              required,
              nil,
              requirement.input_options["computed_compliance"]
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
          :bcaddress,
          requirement_block_key,
          "Address",
          false,
          :bcaddress
        )
      ]
    }
    multi_data_grid_form_json(key, component, true, "Add #{requirement.label}")
  end

  def get_multiply_sum_grid_form_json(
    requirement_block_key = requirement&.requirement_block&.key
  )
    return {} unless requirement.input_type_multiply_sum_grid?

    grid_key = "#{requirement.key(requirement_block_key)}|grid"
    total_key = "#{requirement.key(requirement_block_key)}|totalLoad"
    quantity_total_key =
      "#{requirement.key(requirement_block_key)}|totalQuantity"
    section_key = PermitApplication.section_from_key(requirement_block_key)

    # Allow rows to be provided via input_options["rows"]. Each row should
    # be a hash with { name: String, : Number }.
    configured_rows = requirement.input_options["rows"]
    # Do not force defaults; rows are fully configurable from the editor UI
    default_rows = []
    rows =
      (
        if configured_rows.is_a?(Array) && configured_rows.any?
          configured_rows
        else
          default_rows
        end
      )

    datagrid_default_value =
      rows.map { |r| { "name" => r["name"], "a" => r["a"] } }

    headers = requirement.input_options["headers"] || {}
    first_col_label = headers["first_column"].presence || "Item name"
    a_col_label = "#{headers["a"].presence} (A)"
    quantity_col_label = "#{headers["quantity"].presence} (B)"
    ab_col_label = "#{headers["ab"].presence} (A × B)"

    # Version the component keys based on configuration so stale submission data from
    # previous template versions (with different headers/rows) will not be reused.
    begin
      raw_rows = configured_rows.is_a?(Array) ? configured_rows : []
      signature_payload = {
        "rows" => raw_rows.map { |r| { "name" => r["name"], "a" => r["a"] } },
        "headers" => headers
      }
      version_sig =
        Digest::MD5.hexdigest(JSON.generate(signature_payload))[0, 8]
      grid_key =
        "#{requirement.key(requirement_block_key)}|grid|v#{version_sig}"
      total_key =
        "#{requirement.key(requirement_block_key)}|totalLoad|v#{version_sig}"
      quantity_total_key =
        "#{requirement.key(requirement_block_key)}|totalQuantity|v#{version_sig}"
    rescue => e
      # If anything goes wrong computing the signature, fall back to non-versioned keys
    end

    datagrid_component = {
      label: requirement.label,
      id: requirement.id,
      reorder: false,
      layoutFixed: false,
      enableRowGroups: false,
      initEmpty: false,
      hideLabel: true,
      tableView: false,
      key: grid_key,
      type: "datagrid",
      input: true,
      validate: {
        minLength: datagrid_default_value.length,
        maxLength: datagrid_default_value.length
      },
      defaultValue: datagrid_default_value,
      components: [
        {
          label: first_col_label,
          type: "textfield",
          key: "name",
          disabled: true,
          readOnly: true,
          input: true,
          calculateValue:
            "var defs=(instance && instance.parent && instance.parent.component && instance.parent.component.defaultValue)||[]; var i=rowIndex; if(!value && defs[i]){ value = defs[i].name || ''; }"
        },
        {
          label: a_col_label,
          type: "number",
          key: "a",
          disabled: true,
          readOnly: true,
          input: true,
          decimalLimit: 7,
          calculateValue:
            "var defs=(instance && instance.parent && instance.parent.component && instance.parent.component.defaultValue)||[]; var i=rowIndex; if(!value && defs[i]){ value = Number(defs[i].a || 0); }"
        },
        {
          label: quantity_col_label,
          type: "number",
          key: "quantity",
          input: true,
          validate: {
            min: 0
          },
          decimalLimit: 7
        },
        {
          label: ab_col_label,
          type: "number",
          key: "load",
          disabled: true,
          readOnly: true,
          input: true,
          persistent: "client",
          decimalLimit: 7,
          calculateValue:
            "var a = Number(row.a)||0; var b = Number(row.quantity)||0; var r = a*b; value = Math.round(r*10)/10;"
        }
      ]
    }

    total_quantity_component = {
      label: "Total #{quantity_col_label}:",
      type: "number",
      defaultValue: 0,
      key: quantity_total_key,
      disabled: true,
      readOnly: true,
      input: true,
      validate: {
        required: true
      },
      decimalLimit: 7,
      calculateValue:
        "var section = '#{section_key}'; var list = (data && data[section] && data[section]['#{grid_key}']) || []; var sum = 0; for (var i=0;i<list.length;i++){ var b = Number(list[i] && list[i].quantity || 0); sum += b; } value = sum;"
    }

    total_component = {
      label: "Total #{ab_col_label}:",
      type: "number",
      defaultValue: 0,
      key: total_key,
      disabled: true,
      readOnly: true,
      input: true,
      validate: {
        required: true
      },
      decimalLimit: 7,
      calculateValue:
        "var section = '#{section_key}'; var list = (data && data[section] && data[section]['#{grid_key}']) || []; var sum = 0; for (var i=0;i<list.length;i++){ var a = Number(list[i] && list[i].a || 0); var b = Number(list[i] && list[i].quantity || 0); sum += (a*b); } value = sum;"
    }

    {
      id: requirement.id,
      key: requirement.key(requirement_block_key),
      type: "fieldset",
      legend: requirement.label,
      custom_class: "multiply-sum-grid",
      label: requirement.label,
      hideLabel: true,
      input: false,
      tableView: false,
      components: [
        datagrid_component,
        total_quantity_component,
        total_component
      ]
    }
  end

  def get_architectural_drawing_form_json(
    requirement_block_key = requirement&.requirement_block&.key
  )
    return {} unless requirement.input_type_architectural_drawing?

    {
      id: requirement.id,
      key: requirement.key(requirement_block_key),
      type: "button",
      label: requirement.label,
      action: "custom",
      disableOnInvalid: true,
      input: true,
      theme: "primary",
      custom:
        "document.dispatchEvent(new CustomEvent('openArchitecturalDrawingTool', { detail: { requirementCode: '#{escape_for_js(requirement.key(requirement_block_key))}' } }));"
    }
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
    return {} unless requirement.input_type.present?

    input_type = requirement.input_type
    input_options = requirement.input_options

    if input_options["value_options"].is_a?(Array)
      input_options["value_options"].select! do |option|
        option["label"].present? && option["value"].present?
      end
    end

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
          if requirement.key(requirement&.requirement_block&.key).end_with?(
               "energy_step_code_report_file"
             )
            file_hash[:tooltip] = ENERGY_STEP_CODE_TOOLTIP_URL
          elsif input_options["computed_compliance"].present?
            file_hash[:tooltip] = I18n.t(
              "formio.requirement.auto_compliance.tooltip"
            )
          end
        end
      )
    end
    options = DEFAULT_FORMIO_TYPE_TO_OPTIONS[input_type.to_sym] || {}
    if input_options["computed_compliance"].present?
      options[:tooltip] = I18n.t("formio.requirement.auto_compliance.tooltip")
    end

    options
  end

  def snake_to_camel(snake_str)
    components = snake_str.split("_")
    # capitalize the first letter of each component except the first
    components[0] + components[1..-1].map(&:capitalize).join
  end

  private

  def inject_step_code_existing_link!(json, step_code_type, key)
    begin
      # Find the link-styled button and inject the requirement key into its event
      components = json[:components].is_a?(Array) ? json[:components] : []
      link_button =
        components.find do |c|
          c.is_a?(Hash) && c[:type] == "button" &&
            c[:custom_class] == "step-code-link-button"
        end
      return unless link_button

      link_button[
        :custom
      ] = "document.dispatchEvent(new CustomEvent('openExistingStepCode', { detail: { key: '#{escape_for_js(key)}', stepCodeType: '#{step_code_type}' } }));"
    rescue StandardError
      # no-op
    end
  end

  def get_general_contact_type_options
    I18n
      .t("formio.requirement.contact.contact_type_options.general")
      .map { |key, value| { label: value, value: key.to_s.camelize(:lower) } }
  end

  def get_professional_contact_type_options
    I18n
      .t("formio.requirement.contact.contact_type_options.professional")
      .map { |key, value| { label: value, value: key.to_s.camelize(:lower) } }
  end

  def get_contact_type_component(parent_key, required, options)
    key = "#{parent_key}|contactType"
    {
      "label" => "Contact Type",
      "widget" => "choicesjs",
      "tableView" => true,
      "key" => key,
      "type" => "select",
      "input" => true,
      "data" => {
        "values" => options
      },
      "validate" => {
        "required" => required
      }
    }
  end

  # Escape for single-quoted JS strings
  def escape_for_js(str)
    str.to_s.gsub(/['\\]/) { |match| "\\#{match}" }
  end
end

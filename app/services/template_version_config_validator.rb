class TemplateVersionConfigValidator
  OPTIONS_MAP_KEY_PREFIX = "compliance-options-map-prefix-"
  DATA_VALIDATION_OPERATIONS = {
    "number" => %w[min max],
    "date" => %w[before after],
    "multi_option_select" => %w[min_selected_count max_selected_count],
    "file" => %w[allowed_file_types]
  }.freeze

  RequirementAdapter =
    Struct.new(
      :computed_compliance,
      :input_type,
      :value_options,
      keyword_init: true
    )

  def initialize(requirement_blocks_json:, denormalized_template_json:)
    @blocks = normalize_blocks(requirement_blocks_json)
    @template = normalize_hash(denormalized_template_json)
    @errors = []
  end

  def validate!
    @blocks.each_value do |block|
      validate_requirement_conditionals(block)
      validate_data_validation(block)
      validate_computed_compliance(block)
    end
    validate_block_conditionals

    return true if @errors.empty?

    raise TemplateVersionConfigError,
          "Template configuration is invalid: #{@errors.join("; ")}"
  end

  private

  def normalize_blocks(requirement_blocks_json)
    normalize_hash(requirement_blocks_json).each_with_object(
      {}
    ) do |(id, data), blocks|
      block = normalize_hash(data)
      block["id"] ||= id.to_s
      blocks[block["id"].to_s] = block
    end
  end

  def normalize_hash(value)
    value.is_a?(Hash) ? value.deep_stringify_keys : {}
  end

  def read(hash, key)
    return unless hash.is_a?(Hash)
    return hash[key] if hash.key?(key)

    hash[key.camelize(:lower)]
  end

  def requirements_for(block)
    Array(read(block, "requirements")).filter_map do |requirement|
      normalize_hash(requirement) if requirement.is_a?(Hash)
    end
  end

  def input_options_for(requirement)
    normalize_hash(read(requirement, "input_options"))
  end

  def value_options_for(requirement)
    Array(
      read(input_options_for(requirement), "value_options")
    ).filter_map { |option| normalize_hash(option) if option.is_a?(Hash) }
  end

  def validate_requirement_conditionals(block)
    requirements = requirements_for(block)
    requirements_by_code =
      requirements.index_by do |requirement|
        read(requirement, "requirement_code")
      end

    requirements.each do |requirement|
      conditional =
        normalize_hash(read(input_options_for(requirement), "conditional"))
      next if conditional.empty?

      operator = read(conditional, "operator").presence || "isEqual"
      unless RequirementBlock::VALID_FORMIO_OPERATORS.include?(operator)
        add_requirement_error(
          block,
          requirement,
          "conditional has an unrecognized operator: #{operator}"
        )
        next
      end

      needs_value = !RequirementBlock::VALUELESS_OPERATORS.include?(operator)
      when_code = read(conditional, "when")
      if when_code.blank? || (needs_value && read(conditional, "eq").blank?) ||
           [read(conditional, "show"), read(conditional, "hide")].all?(&:blank?)
        add_requirement_error(
          block,
          requirement,
          "conditional must have when, operator, and one of show or hide (plus eq for value-based operators)"
        )
        next
      end

      trigger = requirements_by_code[when_code]
      if trigger.blank?
        add_requirement_error(
          block,
          requirement,
          "conditional references missing field code #{when_code.inspect}"
        )
        next
      end

      validate_conditional_option(
        block,
        requirement,
        trigger,
        conditional,
        operator
      )
    end
  end

  def validate_conditional_option(
    block,
    dependent_requirement,
    trigger_requirement,
    conditional,
    operator
  )
    # HUB-5289: Stale option references are still surfaced at publication time
    # rather than while editing the block.
    return if RequirementBlock::VALUELESS_OPERATORS.include?(operator)

    option_values =
      value_options_for(trigger_requirement).map do |option|
        read(option, "value")
      end
    return if option_values.empty?
    return if option_values.include?(read(conditional, "eq"))

    add_requirement_error(
      block,
      dependent_requirement,
      "conditional value #{read(conditional, "eq").inspect} is not an option on #{requirement_name(trigger_requirement)}"
    )
  end

  def validate_data_validation(block)
    requirements_for(block).each do |requirement|
      data_validation =
        normalize_hash(read(input_options_for(requirement), "data_validation"))
      next if data_validation.empty?

      input_type = read(requirement, "input_type")
      allowed_operations = DATA_VALIDATION_OPERATIONS[input_type]
      if allowed_operations.blank?
        add_requirement_error(
          block,
          requirement,
          "data validation is not allowed for #{input_type.inspect} inputs"
        )
        next
      end

      operation = read(data_validation, "operation")
      if operation.blank? || read(data_validation, "value").blank?
        add_requirement_error(
          block,
          requirement,
          "data validation must have operation and value"
        )
        next
      end

      next if allowed_operations.include?(operation)

      add_requirement_error(
        block,
        requirement,
        "data validation operation must be one of #{allowed_operations.join(", ")} for #{input_type} inputs"
      )
    end
  end

  def validate_computed_compliance(block)
    requirements_for(block).each do |requirement|
      computed_compliance =
        normalize_hash(
          read(input_options_for(requirement), "computed_compliance")
        )
      next if computed_compliance.empty?

      options_map = read(computed_compliance, "options_map")
      if options_map.is_a?(Hash)
        computed_compliance["options_map"] = options_map.transform_keys do |key|
          key.to_s.delete_prefix(OPTIONS_MAP_KEY_PREFIX)
        end
      end

      adapter =
        RequirementAdapter.new(
          computed_compliance: computed_compliance,
          input_type: read(requirement, "input_type"),
          value_options: value_options_for(requirement)
        )
      error =
        AutomatedComplianceConfigurationService.new(
          adapter
        ).validate_configuration[
          :error
        ]
      next if error.blank?

      add_requirement_error(block, requirement, "automated compliance #{error}")
    end
  end

  def validate_block_conditionals
    placements = template_block_placements
    block_ids = placements.map { |placement| placement[:block_id] }
    dependency_map = {}

    placements.each do |placement|
      conditional = placement[:conditional]
      next if conditional.empty?

      block_id = placement[:block_id]
      when_block_id = read(conditional, "when_block_id").to_s
      when_requirement_code = read(conditional, "when_requirement_code")
      operator = read(conditional, "operator").presence || "isEqual"
      needs_value = !RequirementBlock::VALUELESS_OPERATORS.include?(operator)

      unless RequirementBlock::VALID_FORMIO_OPERATORS.include?(operator)
        add_block_error(
          block_id,
          "conditional has an unrecognized operator: #{operator}"
        )
        next
      end

      if when_block_id.blank? || when_requirement_code.blank? ||
           (needs_value && read(conditional, "eq").blank?)
        add_block_error(
          block_id,
          "conditional must have when_block_id, when_requirement_code, and operator (plus eq for value-based operators)"
        )
        next
      end

      show = read(conditional, "show")
      hide = read(conditional, "hide")
      if show.blank? == hide.blank?
        add_block_error(
          block_id,
          "conditional must specify exactly one of show or hide"
        )
        next
      end

      if when_block_id == block_id
        add_block_error(
          block_id,
          "conditional cannot reference itself; use a field conditional instead"
        )
        next
      end

      unless block_ids.include?(when_block_id)
        add_block_error(
          block_id,
          "conditional references a block not in this template"
        )
        next
      end

      trigger_requirement =
        requirements_for(@blocks[when_block_id]).find do |requirement|
          read(requirement, "requirement_code") == when_requirement_code
        end
      if trigger_requirement.blank?
        add_block_error(
          block_id,
          "conditional references missing field code #{when_requirement_code.inspect} in #{block_name(@blocks[when_block_id])}"
        )
        next
      end

      validate_block_conditional_option(
        block_id,
        trigger_requirement,
        conditional,
        operator
      )
      dependency_map[block_id] = when_block_id
    end

    validate_block_conditional_cycles(dependency_map)
  end

  def template_block_placements
    sections =
      Array(
        read(@template, "requirement_template_sections")
      ).filter_map { |section| normalize_hash(section) if section.is_a?(Hash) }

    sections.flat_map do |section|
      Array(read(section, "template_section_blocks")).filter_map do |placement|
        placement = normalize_hash(placement)
        block = normalize_hash(read(placement, "requirement_block"))
        block_id = read(block, "id").to_s
        next if block_id.blank?

        {
          block_id: block_id,
          conditional: normalize_hash(read(placement, "conditional"))
        }
      end
    end
  end

  def validate_block_conditional_option(
    dependent_block_id,
    trigger_requirement,
    conditional,
    operator
  )
    return if RequirementBlock::VALUELESS_OPERATORS.include?(operator)

    option_values =
      value_options_for(trigger_requirement).map do |option|
        read(option, "value")
      end
    return if option_values.empty?
    return if option_values.include?(read(conditional, "eq"))

    add_block_error(
      dependent_block_id,
      "conditional value #{read(conditional, "eq").inspect} is not an option on #{requirement_name(trigger_requirement)}"
    )
  end

  def validate_block_conditional_cycles(dependency_map)
    dependency_map.each_key do |start_id|
      visited = Set.new
      current = start_id

      while dependency_map.key?(current)
        if visited.include?(current)
          add_block_error(
            start_id,
            "conditionals contain a circular dependency"
          )
          return
        end

        visited.add(current)
        current = dependency_map[current]
      end
    end
  end

  def add_requirement_error(block, requirement, message)
    @errors << "#{block_name(block)}, field #{requirement_name(requirement)}: #{message}"
  end

  def add_block_error(block_id, message)
    @errors << "#{block_name(@blocks[block_id])}: #{message}"
  end

  def block_name(block)
    name = read(block, "name")
    if name.present?
      "Block #{name.inspect}"
    else
      "Block #{read(block, "id").inspect}"
    end
  end

  def requirement_name(requirement)
    (
      read(requirement, "label").presence ||
        read(requirement, "requirement_code").presence ||
        read(requirement, "id")
    ).inspect
  end
end

class SeededRequirementTemplateService
  SEEDED_TEMPLATE_NICKNAMES = [
    "Small Complete Template",
    "Large Part 9 Template",
    "Large Part 3 Template"
  ].freeze

  def self.seed!
    new.seed!
  end

  def seed!
    template_definitions.each { |definition| seed_template!(definition) }

    RequirementTemplate.reindex
  end

  private

  def seed_template!(definition)
    ActiveRecord::Base.transaction do
      template =
        RequirementTemplate.find_or_initialize_by(
          nickname: definition.fetch(:nickname)
        )
      template.assign_attributes(
        description: definition.fetch(:description),
        available_globally: true
      )
      template.tag_list = definition.fetch(:tags)
      template.save!

      reset_seeded_template!(template, definition)
      build_template_structure!(template, definition)
      validate_template_structure!(template)
      create_template_versions!(template, definition)
    end
  end

  def reset_seeded_template!(template, definition)
    template.template_versions.destroy_all
    template.requirement_template_sections.destroy_all

    RequirementBlock.where(name: block_names_for(definition)).find_each(
      &:destroy!
    )
  end

  def build_template_structure!(template, definition)
    block_ids_by_name = {}

    definition
      .fetch(:sections)
      .each_with_index do |section_definition, index|
        section =
          template.requirement_template_sections.create!(
            name: section_definition.fetch(:name),
            position: index
          )

        section_definition
          .fetch(:blocks)
          .each_with_index do |block_definition, i|
            block = create_requirement_block!(block_definition)
            block_ids_by_name[block.name] = block.id

            section.template_section_blocks.create!(
              requirement_block: block,
              position: i,
              conditional:
                resolved_conditional(
                  block_definition[:conditional],
                  block_ids_by_name
                )
            )
          end
      end
  end

  def create_requirement_block!(definition)
    block =
      RequirementBlock.create!(
        name: definition.fetch(:name),
        display_name: definition.fetch(:display_name),
        display_description: definition[:display_description] || "",
        association_list: definition[:associations] || []
      )

    definition
      .fetch(:requirements)
      .each_with_index do |requirement, index|
        block.requirements.create!(
          {
            label: requirement.fetch(:label),
            requirement_code: requirement.fetch(:requirement_code),
            input_type: requirement.fetch(:input_type),
            input_options: requirement.fetch(:input_options, {}),
            hint: requirement[:hint],
            instructions: requirement[:instructions],
            required: requirement.fetch(:required, true),
            elective: requirement.fetch(:elective, false),
            position: index
          }.compact
        )
      end

    block.reload
    return block if block.valid?

    raise ActiveRecord::RecordInvalid, block
  end

  def resolved_conditional(conditional, block_ids_by_name)
    return nil if conditional.blank?

    conditional = conditional.deep_dup
    when_block_id = conditional["when_block_id"]
    conditional["when_block_id"] = block_ids_by_name.fetch(
      when_block_id
    ) if block_ids_by_name.key?(when_block_id)

    conditional
  end

  def validate_template_structure!(template)
    template.reload
    template.requirement_template_sections_attributes_copy =
      template.requirement_template_sections.map do |section|
        {
          "template_section_blocks_attributes" =>
            section.template_section_blocks.map do |section_block|
              {
                "requirement_block_id" => section_block.requirement_block_id,
                "conditional" => section_block.conditional
              }.compact
            end
        }
      end

    return if template.valid?

    raise ActiveRecord::RecordInvalid, template
  end

  def create_template_versions!(template, definition)
    published_version_date = Date.yesterday
    published_version = nil

    Timecop.freeze(published_version_date - 1.day) do
      published_version =
        TemplateVersioningService.schedule!(template, published_version_date)
    end

    published_version.update!(
      change_notes: "Seeded published version for local development.",
      change_significance: "major",
      notification_scope: "silent"
    )

    Timecop.freeze(published_version_date) do
      TemplateVersioningService.publish_version!(published_version)
    end

    TemplateVersioningService.create_draft!(template)

    scheduled_version =
      TemplateVersioningService.schedule!(template, Date.tomorrow)
    scheduled_version.update!(
      change_notes: definition.fetch(:scheduled_change_notes),
      change_significance: "minor",
      notification_scope: "silent"
    )
  end

  def block_names_for(definition)
    definition
      .fetch(:sections)
      .flat_map { |section| section.fetch(:blocks).map { |b| b.fetch(:name) } }
  end

  def template_definitions
    [small_template, large_part_9_template, large_part_3_template]
  end

  def small_template
    {
      nickname: SEEDED_TEMPLATE_NICKNAMES.first,
      description:
        "Small seeded template with simple inputs and basic conditionals.",
      tags: %w[Sandbox Small Seeded],
      scheduled_change_notes: "Small template scheduled seed update.",
      sections: [
        {
          name: "Applicant Details",
          blocks: [
            block(
              "Small Applicant Basics",
              "Applicant Basics",
              [
                req("Project Name", "small_project_name", "text"),
                req(
                  "Estimated Construction Value",
                  "small_estimated_value",
                  "number",
                  input_options: {
                    "number_unit" => "cad",
                    "data_validation" => {
                      "operation" => "min",
                      "value" => "1",
                      "error_message" => "Value must be greater than zero."
                    }
                  }
                ),
                req(
                  "Describe The Proposed Work",
                  "small_project_description",
                  "textarea",
                  required: false,
                  input_options: {
                    "conditional" => {
                      "when" => "small_project_name",
                      "operator" => "isNotEmpty",
                      "show" => true
                    }
                  }
                )
              ]
            )
          ]
        },
        {
          name: "Contacts",
          blocks: [
            block(
              "Small Owner Contact",
              "Owner Contact",
              [
                req(
                  "Owner Contact",
                  "small_owner_contact",
                  "general_contact",
                  input_options: {
                    "can_add_multiple_contacts" => true
                  }
                )
              ]
            )
          ]
        }
      ]
    }
  end

  def large_part_9_template
    large_template(
      nickname: SEEDED_TEMPLATE_NICKNAMES.second,
      description:
        "Large seeded template covering every requirement type except Part 3 step code.",
      step_code_part: :part_9,
      prefix: "part9",
      scheduled_change_notes: "Part 9 template scheduled seed update."
    )
  end

  def large_part_3_template
    large_template(
      nickname: SEEDED_TEMPLATE_NICKNAMES.third,
      description:
        "Large seeded template covering every requirement type except Part 9 step code.",
      step_code_part: :part_3,
      prefix: "part3",
      scheduled_change_notes: "Part 3 template scheduled seed update."
    )
  end

  def large_template(
    nickname:,
    description:,
    step_code_part:,
    prefix:,
    scheduled_change_notes:
  )
    trigger_block_name = "#{prefix.upcase} Project Basics"
    {
      nickname:,
      description:,
      tags: ["Sandbox", "Large", "Seeded", step_code_part.to_s.camelize],
      scheduled_change_notes:,
      sections: [
        {
          name: "Project Information",
          blocks: [
            project_basics_block(prefix, trigger_block_name),
            block(
              "#{prefix.upcase} Secondary Suite Details",
              "Secondary Suite Details",
              [
                req(
                  "Secondary Suite Description",
                  "#{prefix}_secondary_suite_description",
                  "textarea"
                )
              ],
              conditional: {
                "when_block_id" => "__#{trigger_block_name}__",
                "when_requirement_code" => "#{prefix}_has_secondary_suite",
                "operator" => "isEqual",
                "eq" => true,
                "show" => true
              }
            )
          ]
        },
        {
          name: "People",
          blocks: [contacts_block(prefix), communication_block(prefix)]
        },
        {
          name: "Documents",
          blocks: [documents_block(prefix), optional_electives_block(prefix)]
        },
        {
          name: "Technical Review",
          blocks: [
            technical_block(prefix),
            step_code_block(prefix, step_code_part)
          ]
        }
      ]
    }.tap { |definition| resolve_block_conditionals!(definition) }
  end

  def project_basics_block(prefix, name)
    block(
      name,
      "Project Basics",
      [
        req(
          "Full Address",
          "#{prefix}_full_address",
          "text",
          input_options: {
            "computed_compliance" => {
              "module" => "PermitApplication",
              "value" => "full_address"
            }
          }
        ),
        req(
          "Project Type",
          "#{prefix}_project_type",
          "select",
          input_options: {
            "value_options" => yes_no_options("New Construction", "Renovation"),
            "computed_compliance" => {
              "module" => "HistoricSite",
              "options_map" => {
                "Y" => "New Construction",
                "N" => "Renovation"
              }
            }
          }
        ),
        req("Has Secondary Suite", "#{prefix}_has_secondary_suite", "checkbox"),
        req(
          "Building Category",
          "#{prefix}_building_category",
          "radio",
          input_options: {
            "value_options" => yes_no_options("Single Detached", "Duplex")
          }
        ),
        req(
          "Building Area",
          "#{prefix}_building_area",
          "number",
          input_options: {
            "number_unit" => "sqm",
            "data_validation" => {
              "operation" => "max",
              "value" => "2500",
              "error_message" => "Area must be 2500 sqm or less."
            }
          }
        ),
        req(
          "Expected Start Date",
          "#{prefix}_expected_start_date",
          "date",
          input_options: {
            "data_validation" => {
              "operation" => "after",
              "value" => Date.current.iso8601
            }
          }
        ),
        req("Site Address", "#{prefix}_site_address", "address"),
        req("BC Address Lookup", "#{prefix}_bc_address", "bcaddress")
      ]
    )
  end

  def contacts_block(prefix)
    block(
      "#{prefix.upcase} Contacts",
      "Contacts",
      [
        req(
          "Applicant Contacts",
          "#{prefix}_applicant_contacts",
          "general_contact",
          input_options: {
            "can_add_multiple_contacts" => true
          }
        ),
        req(
          "Registered Professional",
          "#{prefix}_registered_professional",
          "professional_contact"
        )
      ]
    )
  end

  def communication_block(prefix)
    block(
      "#{prefix.upcase} Communication",
      "Communication",
      [
        req("Primary Phone", "#{prefix}_primary_phone", "phone"),
        req("Primary Email", "#{prefix}_primary_email", "email"),
        req("Applicant Signature", "#{prefix}_applicant_signature", "signature")
      ]
    )
  end

  def documents_block(prefix)
    block(
      "#{prefix.upcase} Documents",
      "Documents",
      [
        req(
          "Supporting Documents",
          "#{prefix}_supporting_documents_file",
          "file",
          input_options: {
            "multiple" => true,
            "data_validation" => {
              "operation" => "allowed_file_types",
              "value" => ".pdf,.jpg,.png"
            },
            "computed_compliance" => {
              "module" => "DigitalSealValidator"
            }
          }
        ),
        architectural_drawing_requirement
      ]
    )
  end

  def optional_electives_block(prefix)
    block(
      "#{prefix.upcase} Optional Electives",
      "Optional Electives",
      [
        req(
          "Optional Notes",
          "#{prefix}_optional_notes",
          "text",
          required: false,
          elective: true,
          input_options: {
            "customConditional" => "show = data.enableOptionalNotes === true"
          }
        ),
        req(
          "Optional Review Types",
          "#{prefix}_optional_review_types",
          "multi_option_select",
          required: false,
          elective: true,
          input_options: {
            "value_options" => yes_no_options("Planning", "Engineering"),
            "data_validation" => {
              "operation" => "max_selected_count",
              "value" => "2"
            }
          }
        )
      ]
    )
  end

  def technical_block(prefix)
    block(
      "#{prefix.upcase} Technical Details",
      "Technical Details",
      [
        req(
          "Parcel Information",
          "#{prefix}_parcel_information",
          "pid_info",
          input_options: {
            "computed_compliance" => {
              "module" => "ParcelInfoExtractor",
              "value" => "PID"
            }
          }
        ),
        req(
          "Fixture Load Grid",
          "#{prefix}_fixture_load_grid",
          "multiply_sum_grid",
          input_options: {
            "headers" => {
              "first_column" => "Fixture",
              "a" => "Load",
              "quantity" => "Quantity",
              "ab" => "Total Load"
            },
            "rows" => [
              { "name" => "Kitchen sink", "a" => 1.5 },
              { "name" => "Bathroom group", "a" => 3.6 },
              { "name" => "Laundry", "a" => 2.0 }
            ]
          }
        )
      ]
    )
  end

  def step_code_block(prefix, step_code_part)
    block(
      "#{prefix.upcase} Energy Step Code",
      "Energy Step Code",
      step_code_requirements(step_code_part)
    )
  end

  def step_code_requirements(step_code_part)
    schema =
      if step_code_part == :part_9
        Requirement::ENERGY_STEP_CODE_PART_9_DEPENDENCY_REQUIRED_SCHEMA
      else
        Requirement::ENERGY_STEP_CODE_PART_3_DEPENDENCY_REQUIRED_SCHEMA
      end

    schema.values.map do |requirement_schema|
      req(
        requirement_schema.fetch("requirement_code").titleize,
        requirement_schema.fetch("requirement_code"),
        requirement_schema.fetch("input_type"),
        input_options: requirement_schema.fetch("input_options", {}).deep_dup
      )
    end
  end

  def architectural_drawing_requirement
    schema =
      Requirement::ARCHITECTURAL_DRAWING_DEPENDENCY_REQUIRED_SCHEMA.fetch(
        :architectural_drawing_file
      )

    req(
      "Architectural Drawing Package",
      schema.fetch("requirement_code"),
      schema.fetch("input_type"),
      input_options: schema.fetch("input_options").deep_dup
    )
  end

  def block(name, display_name, requirements, conditional: nil)
    {
      name: "Seeded #{name}",
      display_name:,
      display_description: "Seeded development block for #{display_name}.",
      associations: ["Seeded"],
      requirements:,
      conditional:
    }.compact
  end

  def req(
    label,
    requirement_code,
    input_type,
    input_options: {},
    hint: nil,
    instructions: nil,
    required: true,
    elective: false
  )
    {
      label:,
      requirement_code:,
      input_type:,
      input_options:,
      hint:,
      instructions:,
      required:,
      elective:
    }
  end

  def yes_no_options(yes_label = "Yes", no_label = "No")
    [
      { "label" => yes_label, "value" => yes_label },
      { "label" => no_label, "value" => no_label }
    ]
  end

  def resolve_block_conditionals!(definition)
    block_name_to_definition =
      definition
        .fetch(:sections)
        .flat_map { |section| section.fetch(:blocks) }
        .index_by { |block_definition| block_definition.fetch(:name) }

    definition
      .fetch(:sections)
      .each do |section|
        section
          .fetch(:blocks)
          .each do |block_definition|
            conditional = block_definition[:conditional]
            next if conditional.blank?

            marker = conditional["when_block_id"]
            unless marker.to_s.start_with?("__") && marker.to_s.end_with?("__")
              next
            end

            target_name =
              "Seeded #{marker.delete_prefix("__").delete_suffix("__")}"
            target_definition = block_name_to_definition.fetch(target_name)
            conditional["when_block_id"] = target_definition.fetch(:name)
          end
      end
  end
end

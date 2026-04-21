class RequirementTemplate < ApplicationRecord
  SEARCH_INCLUDES = %i[
    published_template_version
    draft_template_version
    permit_type
    last_three_deprecated_template_versions
    activity
    scheduled_template_versions
  ]

  searchkick searchable: %i[description current_version permit_type activity],
             word_start: %i[description current_version permit_type activity],
             text_middle: %i[current_version description]

  belongs_to :activity, optional: false
  belongs_to :permit_type, optional: false
  belongs_to :copied_from, class_name: "RequirementTemplate", optional: true

  has_many :requirement_template_sections,
           -> { order(position: :asc) },
           dependent: :destroy
  has_many :requirement_blocks, through: :requirement_template_sections
  has_many :requirements, through: :requirement_blocks
  has_many :template_versions,
           -> { order(version_date: :desc) },
           dependent: :destroy
  has_many :scheduled_template_versions,
           -> do
             where(template_versions: { status: "scheduled" }).order(
               version_date: :desc
             )
           end,
           class_name: "TemplateVersion"
  has_many :last_three_deprecated_template_versions,
           -> do
             where(template_versions: { status: "deprecated" }).order(
               version_date: :desc
             ).limit(3)
           end,
           class_name: "TemplateVersion"
  has_many :jurisdiction_requirement_templates, dependent: :destroy
  has_many :enabled_jurisdictions,
           through: :jurisdiction_requirement_templates,
           source: :jurisdiction
  has_many :jurisdiction_template_version_customizations

  belongs_to :copied_from,
             class_name: "RequirementTemplate",
             foreign_key: "copied_from_id",
             optional: true

  # Self-referential association for sections copied from this section
  has_many :copied_sections,
           class_name: "RequirementTemplate",
           foreign_key: "copied_from_id",
           dependent: :nullify

  has_one :published_template_version,
          -> { where(status: "published") },
          class_name: "TemplateVersion"

  has_one :draft_template_version,
          -> { where(status: "draft") },
          class_name: "TemplateVersion"

  # Scope to get RequirementTemplates with a published template version
  scope :for_sandbox,
        ->(sandbox) do
          joins(:template_versions).where(
            template_versions: {
              status: sandbox&.template_version_status_scope || :published
            }
          )
        end

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at

  include Discard::Model

  accepts_nested_attributes_for :requirement_template_sections,
                                allow_destroy: true

  # This is a workaround needed to validate step code related errors
  attr_accessor :requirement_template_sections_attributes_copy

  validate :validate_uniqueness_of_blocks
  validate :validate_step_code_related_dependencies
  validate :validate_block_level_conditionals
  validate :public_only_for_early_access_preview

  before_validation :set_default_nickname

  def set_default_nickname
    return if nickname.present?

    self.nickname ||= label
  end

  def assignee
    nil
  end

  def early_access?
    type == "EarlyAccessRequirementTemplate"
  end

  def live?
    type == "LiveRequirementTemplate"
  end

  def visibility
    if early_access?
      "early_access"
    elsif live?
      "live"
    end
  end

  def sections
    requirement_template_sections
  end

  def customizations
    # Convenience method to prevent carpal tunnel syndrome
    jurisdiction_template_version_customizations
  end

  def published_customizations_count
    # Returns the count of jurisdictions where this template is enabled
    # (all jurisdictions with access minus those who have explicitly disabled it)
    return 0 unless published_template_version

    disabled_count =
      published_template_version
        .jurisdiction_template_version_customizations
        .live
        .where(disabled: true)
        .distinct
        .count(:jurisdiction_id)

    if available_globally
      # All jurisdictions minus those explicitly disabled
      Jurisdiction.count - disabled_count
    else
      # Jurisdictions with access (via JurisdictionRequirementTemplate) minus disabled
      access_count = jurisdiction_requirement_templates.count
      # Only count disabled ones that actually have access
      disabled_with_access_count =
        published_template_version
          .jurisdiction_template_version_customizations
          .live
          .where(disabled: true)
          .where(
            jurisdiction_id:
              jurisdiction_requirement_templates.select(:jurisdiction_id)
          )
          .distinct
          .count(:jurisdiction_id)
      access_count - disabled_with_access_count
    end
  end

  def explicitly_disabled_jurisdictions
    # Returns the list of jurisdictions that have explicitly disabled this template
    return [] unless published_template_version

    disabled_jurisdiction_ids =
      published_template_version
        .jurisdiction_template_version_customizations
        .live
        .where(disabled: true)
        .distinct
        .pluck(:jurisdiction_id)

    return [] if disabled_jurisdiction_ids.empty?

    if available_globally
      # All disabled jurisdictions
      Jurisdiction.where(id: disabled_jurisdiction_ids)
    else
      # Only disabled ones that actually have access
      Jurisdiction.where(
        id:
          disabled_jurisdiction_ids &
            jurisdiction_requirement_templates.pluck(:jurisdiction_id)
      )
    end
  end

  def label
    return "New template" if permit_type.nil? || activity.nil?

    "#{permit_type.name} | #{activity.name}#{first_nations ? " (" + I18n.t("activerecord.attributes.requirement_template.first_nations") + ")" : ""}"
  end

  def key
    "requirementtemplate#{id}"
  end

  def to_form_json
    block_section_key_map = build_block_section_key_map

    JSON.parse(
      {
        id: id,
        key: key,
        input: false,
        tableView: false,
        components:
          requirement_template_sections
            .map { |s| s.to_form_json(block_section_key_map) }
            .concat(
              [
                {
                  id: "section-completion-id",
                  key: "section-completion-key",
                  type: "container",
                  title: I18n.t("formio.requirement_template.completion_title"),
                  label: I18n.t("formio.requirement_template.completion_title"),
                  custom_class: "formio-section-container",
                  hide_label: false,
                  collapsible: false,
                  initially_collapsed: false,
                  components: [
                    id: "section-signoff-id",
                    key: "section-signoff-key",
                    type: "panel",
                    title:
                      I18n.t("formio.requirement_template.signoff_panel_title"),
                    collapsible: true,
                    collapsed: false,
                    components: [
                      {
                        type: "checkbox",
                        key: "signed",
                        title:
                          I18n.t(
                            "formio.requirement_template.signoff_checkbox_title"
                          ),
                        label:
                          I18n.t(
                            "formio.requirement_template.signoff_checkbox_label"
                          ),
                        inputType: "checkbox",
                        validate: {
                          required: true
                        },
                        input: true,
                        defaultValue: false
                      },
                      {
                        key: "submit",
                        size: "md",
                        type: "button",
                        block: false,
                        input: true,
                        title:
                          I18n.t(
                            "formio.requirement_template.signoff_submit_title"
                          ),
                        label:
                          I18n.t(
                            "formio.requirement_template.signoff_submit_title"
                          ),
                        theme: "primary",
                        action: "submit",
                        widget: {
                          type: "input"
                        },
                        disabled: false,
                        show: false,
                        conditional: {
                          show: true,
                          when: "signed",
                          eq: "true"
                        }
                      }
                    ]
                  ]
                }
              ]
            )
      }.to_json
    )
  end

  def self.published_requirement_template_version(
    activity,
    permit_type,
    first_nations
  )
    find_by(
      activity: activity,
      permit_type: permit_type,
      first_nations: first_nations
    )&.published_template_version
  rescue NoMethodError => e
    rails.logger.error e.message
  end

  def search_data
    {
      nickname: nickname,
      description: description,
      first_nations: first_nations,
      current_version: published_template_version&.version_date,
      permit_type: permit_type.name,
      activity: activity.name,
      discarded: discarded_at.present?,
      assignee: assignee&.name,
      visibility: visibility,
      created_at: created_at,
      used_by: published_customizations_count,
      available_in:
        (
          if available_globally
            Jurisdiction.count
          else
            jurisdiction_requirement_templates.count
          end
        )
    }
  end

  private

  def build_block_section_key_map
    map = {}
    requirement_template_sections
      .includes(template_section_blocks: :requirement_block)
      .each do |section|
        section.template_section_blocks.each do |tsb|
          map[tsb.requirement_block_id] = section.key
        end
      end
    map
  end

  def public_only_for_early_access_preview
    if public && !early_access?
      errors.add(
        :public,
        I18n.t(
          "activerecord.errors.models.requirement_template.attributes.public.true_on_early_access_only"
        )
      )
    end
  end

  def requirement_block_ids_from_nested_attributes_copy
    # have to manually loop instead of using association because
    # when using deeply nested attributes to save, the queries go against the database
    # which will have stale data e.g. records trying to delete currently

    if requirement_template_sections_attributes_copy.blank? ||
         !requirement_template_sections_attributes_copy.is_a?(Array)
      return []
    end

    ids = []

    requirement_template_sections_attributes_copy.each do |rtsa|
      next if rtsa["_destroy"] == true
      rtsa["template_section_blocks_attributes"].each do |tsba|
        next if tsba["_destroy"] == true
        requirement_block_id = tsba["requirement_block_id"]

        ids << requirement_block_id if requirement_block_id.present?
      end
    end

    ids
  end

  def energy_step_code_requirements_from_nest_attributes_copy
    requirement_block_ids = requirement_block_ids_from_nested_attributes_copy

    return [] unless requirement_block_ids.length.positive?

    Requirement.where(
      requirement_block_id: requirement_block_ids,
      input_type: Requirement.input_types[:energy_step_code]
    )
  end

  def architectural_design_file_requirements_from_nest_attributes_copy
    requirement_block_ids = requirement_block_ids_from_nested_attributes_copy

    return [] unless requirement_block_ids.length.positive?

    Requirement.where(
      requirement_block_id: requirement_block_ids,
      requirement_code: Requirement::ARCHITECTURAL_DRAWING_REQUIREMENT_CODE
    )
  end

  def validate_uniqueness_of_blocks
    requirement_block_ids = requirement_block_ids_from_nested_attributes_copy
    grouped_ids = requirement_block_ids.group_by { |e| e }
    duplicate_ids = grouped_ids.select { |_k, v| v.length > 1 }.keys
    duplicates = RequirementBlock.where(id: duplicate_ids).pluck(:name)

    duplicates.each do |duplicate_block_name|
      errors.add(
        :base,
        I18n.t(
          "model_validation.requirement_template.duplicate_block_in_template",
          requirement_block_name: duplicate_block_name
        )
      )
    end
  end

  def block_conditionals_from_nested_attributes_copy
    if requirement_template_sections_attributes_copy.blank? ||
         !requirement_template_sections_attributes_copy.is_a?(Array)
      return []
    end

    conditionals = []
    requirement_template_sections_attributes_copy.each do |rtsa|
      next if rtsa["_destroy"] == true
      next if rtsa["template_section_blocks_attributes"].blank?

      rtsa["template_section_blocks_attributes"].each do |tsba|
        next if tsba["_destroy"] == true
        next if tsba["conditional"].blank?

        conditionals << {
          block_id: tsba["requirement_block_id"],
          conditional: tsba["conditional"]
        }
      end
    end
    conditionals
  end

  VALID_FORMIO_OPERATORS = %w[
    isEqual
    isNotEqual
    greaterThan
    greaterThanOrEqual
    lessThan
    lessThanOrEqual
    isDateEqual
    isNotDateEqual
    dateGreaterThan
    dateGreaterThanOrEqual
    dateLessThan
    dateLessThanOrEqual
    isEmpty
    isNotEmpty
  ].freeze

  VALUELESS_OPERATORS = %w[isEmpty isNotEmpty].freeze

  def validate_block_level_conditionals
    block_ids = requirement_block_ids_from_nested_attributes_copy
    return if block_ids.blank?

    block_conditionals = block_conditionals_from_nested_attributes_copy
    return if block_conditionals.blank?

    dependency_map = {}

    block_conditionals.each do |entry|
      cond = entry[:conditional]
      block_id = entry[:block_id]

      when_block_id = cond["when_block_id"]
      when_requirement_code = cond["when_requirement_code"]
      operator = cond["operator"] || "isEqual"
      eq_value = cond["eq"]
      show = cond["show"]
      hide = cond["hide"]

      unless VALID_FORMIO_OPERATORS.include?(operator)
        errors.add(
          :base,
          "Block conditional has an unrecognized operator: #{operator}"
        )
        next
      end

      needs_value = !VALUELESS_OPERATORS.include?(operator)

      if when_block_id.blank? || when_requirement_code.blank? ||
           (needs_value && eq_value.blank?)
        errors.add(
          :base,
          "Block conditional must have when_block_id, when_requirement_code, and operator (plus eq for value-based operators)"
        )
        next
      end

      if show.blank? && hide.blank?
        errors.add(:base, "Block conditional must specify either show or hide")
        next
      end

      if show.present? && hide.present?
        errors.add(
          :base,
          "Block conditional must specify only one of show or hide"
        )
        next
      end

      if when_block_id == block_id
        errors.add(
          :base,
          "Block conditional cannot reference itself; use requirement-level conditionals instead"
        )
        next
      end

      unless block_ids.include?(when_block_id)
        errors.add(
          :base,
          "Block conditional references a block not in this template"
        )
        next
      end

      when_block = RequirementBlock.find_by(id: when_block_id)
      if when_block.blank? ||
           when_block.requirements.none? { |r|
             r.requirement_code == when_requirement_code
           }
        errors.add(
          :base,
          "Block conditional references a requirement code that does not exist in the target block"
        )
        next
      end

      dependency_map[block_id] = when_block_id
    end

    detect_circular_block_conditionals(dependency_map)
  end

  def detect_circular_block_conditionals(dependency_map)
    dependency_map.each_key do |start_id|
      visited = Set.new
      current = start_id

      while dependency_map.key?(current)
        if visited.include?(current)
          errors.add(:base, "Block conditionals contain a circular dependency")
          return
        end
        visited << current
        current = dependency_map[current]
      end
    end
  end

  def validate_step_code_related_dependencies
    energy_step_code_requirements_count =
      energy_step_code_requirements_from_nest_attributes_copy.count
    architectural_drawing_file_requirements_count =
      architectural_design_file_requirements_from_nest_attributes_copy.count

    has_any_step_code_requirements = energy_step_code_requirements_count > 0
    has_any_architectural_drawing_file_requirements =
      architectural_drawing_file_requirements_count > 0
    has_duplicate_step_code_requirements =
      energy_step_code_requirements_count > 1
    has_duplicate_architectural_drawing_file_requirements =
      architectural_drawing_file_requirements_count > 1

    return unless has_any_step_code_requirements

    if !has_any_architectural_drawing_file_requirements
      errors.add(:base, :step_code_package_required)
    end
    if has_duplicate_step_code_requirements
      errors.add(:base, :duplicate_energy_step_code)
    end
    if has_duplicate_architectural_drawing_file_requirements
      errors.add(:base, :duplicate_step_code_package)
    end
  end

  def refresh_search_index
    RequirementTemplate.search_index.refresh
  end

  def log_creation_in_specs
    return unless defined?(RSpec.current_example)

    puts ">>>> RequirementTemplate created by: #{RSpec.current_example.full_description}"
  end
end

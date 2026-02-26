class RequirementTemplate < ApplicationRecord
  SEARCH_INCLUDES = %i[
    published_template_version
    draft_template_version
    last_three_deprecated_template_versions
    scheduled_template_versions
  ]

  searchkick searchable: %i[description current_version nickname tags],
             word_start: %i[description current_version nickname tags],
             text_middle: %i[current_version description]

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
  has_many :jurisdiction_template_version_customizations

  belongs_to :copied_from,
             class_name: "RequirementTemplate",
             foreign_key: "copied_from_id",
             optional: true

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

  acts_as_taggable_on :tags

  accepts_nested_attributes_for :requirement_template_sections,
                                allow_destroy: true

  attr_accessor :requirement_template_sections_attributes_copy

  validate :validate_uniqueness_of_blocks
  validate :validate_step_code_related_dependencies

  before_validation :set_default_nickname

  def set_default_nickname
    return if nickname.present?

    self.nickname = tag_list.join(" | ").presence || "New template"
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
    jurisdiction_template_version_customizations
  end

  def published_customizations_count
    published_template_version&.jurisdiction_template_version_customizations_count ||
      0
  end

  def key
    "requirementtemplate#{id}"
  end

  def to_form_json
    JSON.parse(
      {
        id: id,
        key: key,
        input: false,
        tableView: false,
        components:
          requirement_template_sections.map(&:to_form_json).concat(
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

  def search_data
    {
      nickname: nickname,
      description: description,
      tags: tag_list.join(", "),
      current_version: published_template_version&.version_date,
      discarded: discarded_at.present?,
      assignee: assignee&.name,
      visibility: visibility,
      created_at: created_at,
      used_by: published_customizations_count
    }
  end

  private

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

  def requirement_block_ids_from_nested_attributes_copy
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

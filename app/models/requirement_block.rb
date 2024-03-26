class RequirementBlock < ApplicationRecord
  include HtmlSanitizeAttributes

  sanitizable :display_description
  searchkick searchable: %i[name requirement_labels associations configurations],
             word_start: %i[name requirement_labels associations configurations]

  has_many :requirements, -> { order(position: :asc) }, dependent: :destroy

  has_many :template_section_blocks, dependent: :destroy
  has_many :requirement_template_sections, through: :template_section_blocks

  accepts_nested_attributes_for :requirements, allow_destroy: true

  enum sign_off_role: { any: 0 }, _prefix: true
  enum reviewer_role: { any: 0 }, _prefix: true

  validates :sku, uniqueness: true, presence: true
  validates :name, uniqueness: true, presence: true
  validates :display_name, presence: true
  before_validation :set_sku

  acts_as_taggable_on :associations

  def search_data
    {
      updated_at: updated_at,
      name: name,
      requirement_labels: requirements.pluck(:label),
      associations: association_list,
      configurations: configurations_search_list,
    }
  end

  def key(section_key = nil)
    "formSubmissionDataRST#{section_key}|RB#{id}"
  end

  def to_form_json(section_key = nil)
    {
      id: id,
      key: key(section_key),
      type: "panel",
      title: name,
      description: display_description,
      collapsible: true,
      collapsed: false,
      components: components_form_json(section_key),
    }
  end

  def components_form_json(section_key)
    optional_block = requirements.all? { |req| !req.required }
    requirement_map = requirements.map { |r| r.to_form_json(key(section_key)) }

    requirement_map.push(optional_block_confirmation_requirement(section_key)) if optional_block

    requirement_map
  end

  def optional_block_confirmation_requirement(section_key)
    {
      id: "#{id}-confirmation",
      key: "#{key(section_key)}|confirmation",
      type: "checkbox",
      custom_class: "optional-block-confirmation-checkbox",
      validate: {
        required: true,
      },
      input: true,
      label: I18n.t("formio.requirement_block.optional_block_confirmation_requirement_label"),
      widget: {
        type: "input",
      },
    }
  end

  def lookup_props(section_key = nil)
    requirements.map { |r| r.lookup_props(key(section_key)) }
  end

  private

  def configurations_search_list
    configurations = []
    has_any_elective = requirements.any?(&:elective?)
    has_any_conditional = requirements.any?(&:has_conditional?)
    has_any_data_validation = requirements.any?(&:has_data_validation?)

    configurations << "elective" if has_any_elective
    configurations << "conditional" if has_any_conditional
    configurations << "data_validation" if has_any_data_validation

    configurations
  end

  # sku should be auto generated. Use uuid if not provided
  def set_sku
    self.sku ||= SecureRandom.uuid
  end
end

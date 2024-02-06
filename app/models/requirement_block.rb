class RequirementBlock < ApplicationRecord
  searchkick searchable: %i[name requirement_labels associations],
             word_start: %i[name requirement_labels associations]

  has_many :requirements, -> { order(position: :asc) }, dependent: :destroy

  has_many :template_section_blocks, dependent: :destroy
  has_many :requirement_template_sections,
           through: :requirement_template_section_requirement_blocks
  has_many :requirement_templates, through: :template_section_blocks

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
      associations: association_list
    }
  end

  def key(section_key = nil)
    "formSubmissionDataRST#{section_key}|RB#{id}"
  end

  def to_form_json(section_key = nil)
    {
      id: id,
      legend: name,
      key: key(section_key),
      label: name,
      input: false,
      tableView: false,
      components: requirements.map { |r| r.to_form_json(key(section_key)) }
    }
  end

  private

  # sku should be auto generated. Use uuid if not provided
  def set_sku
    self.sku ||= SecureRandom.uuid
  end
end

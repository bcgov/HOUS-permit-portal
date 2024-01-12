class RequirementBlock < ApplicationRecord
  searchkick searchable: %i[name requirement_labels associations], word_start: %i[name requirement_labels associations]

  has_many :requirement_block_requirements, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirements, through: :requirement_block_requirements

  has_many :requirement_template_section_requirement_blocks, dependent: :destroy
  has_many :requirement_templates, through: :requirement_template_section_requirement_blocks

  accepts_nested_attributes_for :requirement_block_requirements, allow_destroy: true

  enum sign_off_role: { any: 0 }, _prefix: true
  enum reviewer_role: { any: 0 }, _prefix: true

  validates :sku, uniqueness: true, presence: true

  before_validation :set_sku

  acts_as_taggable_on :associations

  def search_data
    {
      updated_at: updated_at,
      name: name,
      requirement_labels: requirements.pluck(:label),
      associations: association_list,
    }
  end

  def to_form_json
    {
      id: id,
      legend: name,
      key: "fieldSet#{id}",
      label: name,
      input: false,
      tableView: false,
      components: requirements.map(&:to_form_json),
    }
  end

  private

  # sku should be auto generated. Use uuid if not provided
  def set_sku
    self.sku ||= SecureRandom.uuid
  end
end

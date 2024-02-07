class RequirementTemplateSection < ApplicationRecord
  belongs_to :requirement_template

  has_many :template_section_blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_blocks, through: :template_section_blocks

  accepts_nested_attributes_for :template_section_blocks, allow_destroy: true

  def key
    "section#{id}"
  end

  def to_form_json
    {
      id: id,
      key: key,
      type: "panel",
      title: name,
      collapsible: true,
      initially_collapsed: false,
      components: requirement_blocks.map { |rb| rb.to_form_json(key) },
    }
  end

  def lookup_props
    requirement_blocks.map { |rb| rb.lookup_props(key) }.flatten
  end
end

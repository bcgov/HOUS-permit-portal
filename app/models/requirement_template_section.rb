class RequirementTemplateSection < ApplicationRecord
  belongs_to :requirement_template

  has_many :requirement_template_section_requirement_blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_blocks, through: :requirement_template_section_requirement_blocks

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
end

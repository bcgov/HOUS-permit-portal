class RequirementTemplateSection < ApplicationRecord
  belongs_to :requirement_template

  has_many :template_section_blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_blocks, through: :template_section_blocks

  def to_form_json
    {
      id: id,
      key: "section#{id}",
      type: "panel",
      title: name,
      collapsible: true,
      initially_collapsed: false,
      components: requirement_blocks.map(&:to_form_json),
    }
  end
end

class RequirementTemplateSection < ApplicationRecord
  belongs_to :requirement_template
  belongs_to :copied_from,
             class_name: "RequirementTemplateSection",
             optional: true

  has_many :template_section_blocks,
           -> { order(position: :asc) },
           dependent: :destroy
  has_many :requirement_blocks, through: :template_section_blocks

  accepts_nested_attributes_for :template_section_blocks, allow_destroy: true

  def key
    "section#{id}"
  end

  def to_form_json
    {
      id: id,
      key: key,
      type: "container",
      title: name,
      label: name,
      custom_class: "formio-section-container",
      hide_label: false,
      collapsible: false,
      initially_collapsed: false,
      components: requirement_blocks.map { |rb| rb.to_form_json(key) }
    }
  end
end

class RequirementTemplateSection < ApplicationRecord
  belongs_to :requirement_template

  has_many :requirement_template_section_requirement_blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_blocks, through: :requirement_template_section_requirement_blocks

  def to_form_json
    {
      id: id,
      legend: name,
      key: "fieldSet#{id}",
      label: name,
      input: false,
      tableView: false,
      components: requirement_blocks.map(&:to_form_json),
    }
  end
end

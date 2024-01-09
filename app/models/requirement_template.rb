class RequirementTemplate < ApplicationRecord
  belongs_to :activity
  belongs_to :permit_type

  has_many :requirement_template_requirement_blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_blocks, through: :requirement_template_requirement_blocks

  validates :activity_id, uniqueness: { scope: :permit_type_id }

  def to_form_json
    { id: id, key: "fieldSet#{id}", input: false, tableView: false, components: requirement_blocks.map(&:to_form_json) }
  end
end

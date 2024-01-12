class RequirementTemplate < ApplicationRecord
  belongs_to :activity
  belongs_to :permit_type

  has_many :requirement_template_sections, -> { order(position: :asc) }, dependent: :destroy

  validates :activity_id, uniqueness: { scope: :permit_type_id }

  def to_form_json
    {
      id: id,
      key: "requirementTemplate#{id}",
      input: false,
      tableView: false,
      components: requirement_template_sections.map(&:to_form_json),
    }
  end
end

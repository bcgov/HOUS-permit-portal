class RequirementBlock < ApplicationRecord
  has_many :requirement_block_requirements, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirements, through: :requirement_block_requirements

  enum sign_off_role: { any: 0 }, _prefix: true
  enum reviewer_role: { any: 0 }, _prefix: true

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
end

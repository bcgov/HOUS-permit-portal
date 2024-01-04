class RequirementBlock < ApplicationRecord
  searchkick

  has_many :requirement_block_requirements, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirements, through: :requirement_block_requirements

  accepts_nested_attributes_for :requirement_block_requirements, allow_destroy: true

  enum sign_off_role: { any: 0 }, _prefix: true
  enum reviewer_role: { any: 0 }, _prefix: true

  def search_data
    { updated_at: updated_at, name: name }
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
end

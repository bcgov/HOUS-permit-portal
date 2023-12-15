class RequirementBlockRequirement < ApplicationRecord
  belongs_to :requirement
  belongs_to :requirement_block

  acts_as_list scope: :requirement_block, top_of_list: 0

  validates_uniqueness_of :requirement, scope: :requirement_block
end

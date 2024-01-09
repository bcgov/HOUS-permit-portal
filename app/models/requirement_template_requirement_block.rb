class RequirementTemplateRequirementBlock < ApplicationRecord
  belongs_to :requirement_template
  belongs_to :requirement_block

  acts_as_list scope: :requirement_template, top_of_list: 0

  validates_uniqueness_of :requirement_block, scope: :requirement_template
end

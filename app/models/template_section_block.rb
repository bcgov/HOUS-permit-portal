class TemplateSectionBlock < ApplicationRecord
  belongs_to :requirement_template_section
  belongs_to :requirement_block

  acts_as_list scope: :requirement_template_section, top_of_list: 0

  validates_uniqueness_of :requirement_block, scope: :requirement_template_section
end

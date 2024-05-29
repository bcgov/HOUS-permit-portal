class TemplateSectionBlock < ApplicationRecord
  belongs_to :requirement_template_section
  belongs_to :requirement_block
  has_one :requirement_template, through: :requirement_template_section

  acts_as_list scope: :requirement_template_section, top_of_list: 0
end

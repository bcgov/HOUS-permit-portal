class TemplateSectionBlock < ApplicationRecord
  belongs_to :requirement_template_section
  belongs_to :requirement_block
  has_one :requirement_template, through: :requirement_template_section

  acts_as_list scope: :requirement_template_section, top_of_list: 0

  validate :validate_block_uniqueness_on_template

  private

  def validate_block_uniqueness_on_template
    return unless duplicate_requirement_block_on_template_exists?

    errors.add(
      :requirement_block,
      message:
        I18n.t(
          "model_validation.template_section_block.requirement_block_on_template_exits",
          requirement_block_name: requirement_block.name,
        ),
    )
  end

  def duplicate_requirement_block_on_template_exists?
    requirement_template
      .requirement_template_sections
      .joins(:template_section_blocks)
      .where(template_section_blocks: { requirement_block: requirement_block })
      .where.not(template_section_blocks: { id: id })
      .limit(1)
      .exists?
  end
end

class Requirement < ApplicationRecord
  has_many :requirement_block_requirements, dependent: :destroy
  has_many :requirement_blocks, through: :requirement_block_requirements

  enum input_type: { text: 0, number: 1, checkbox: 2, select: 3, multi_option_select: 4, date: 5 }, _prefix: true

  validate :validate_options_for_select_inputs

  def value_options
    return nil if input_options.blank? || input_options["value_options"].blank?

    input_options["value_options"]
  end

  private

  def validate_options_for_select_inputs
    return unless input_type_select? || input_type_multi_option_select?

    if input_options.blank? || input_options["value_options"].blank? || !input_options["value_options"].is_a?(Array) ||
         !input_options["value_options"].all? { |option| option.is_a?(String) }
      errors.add(:input_options, "select inputs must have options defined")
    end
  end
end

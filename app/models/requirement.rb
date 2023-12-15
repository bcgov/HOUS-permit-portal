class Requirement < ApplicationRecord
  has_many :requirement_block_requirements

  enum input_type: { text: 0, number: 1, checkbox: 2, select: 3, multi_option_select: 4, date: 5 }, _prefix: :input_type
end

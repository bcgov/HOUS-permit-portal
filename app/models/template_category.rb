class TemplateCategory < ApplicationRecord
  has_many :requirement_templates,
           -> { order(:sort_order, :created_at) },
           dependent: :nullify

  acts_as_list column: :sort_order, top_of_list: 0

  validates :label, presence: true, uniqueness: { case_sensitive: false }
  validates :sort_order, numericality: { only_integer: true }

  scope :ordered, -> { order(:sort_order, :created_at) }
end

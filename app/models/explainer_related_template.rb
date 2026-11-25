class ExplainerRelatedTemplate < ApplicationRecord
  belongs_to :explainer, inverse_of: :related_template_links
  belongs_to :requirement_template

  validates :requirement_template_id, uniqueness: { scope: :explainer_id }
end

class TemplateVersion < ApplicationRecord
  belongs_to :requirement_template
  has_many :jurisdiction_template_version_customizations

  enum status: { scheduled: 0, published: 1, deprecated: 2 }, _default: 0
end

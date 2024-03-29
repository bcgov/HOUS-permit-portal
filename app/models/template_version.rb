class TemplateVersion < ApplicationRecord
  belongs_to :requirement_template
  has_many :jurisdiction_template_version_customizations
  has_many :permit_applications

  delegate :permit_type, to: :requirement_template
  delegate :activity, to: :requirement_template

  enum status: { scheduled: 0, published: 1, deprecated: 2 }, _default: 0

  after_save :reindex_requirement_template_if_published, if: :status_changed?

  private

  def reindex_requirement_template_if_published
    reindex_requirement_template if published?
  end
  def reindex_requirement_template
    requirement_template.reindex
  end
end

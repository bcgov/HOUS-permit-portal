class JurisdictionExplainer < ApplicationRecord
  include HtmlSanitizeAttributes

  MAX_LOCAL_CONTEXT_CHARS = 4000

  sanitizable :local_context_html

  belongs_to :jurisdiction
  belongs_to :requirement_template

  before_validation :collapse_local_context
  validates :jurisdiction_id, uniqueness: { scope: :requirement_template_id }
  validate :local_context_within_limit

  scope :filled, -> { where.not(local_context_html: "") }

  def self.previews_for(requirement_template)
    filled
      .where(requirement_template:)
      .joins(:jurisdiction)
      .includes(:jurisdiction)
      .order("jurisdictions.name")
  end

  def filled?
    local_context_html.present?
  end

  private

  def collapse_local_context
    self.local_context_html =
      Note.tiptap_blank?(local_context_html) ? "" : local_context_html.to_s
  end

  def local_context_within_limit
    return if local_context_html.blank?

    count = ActionView::Base.full_sanitizer.sanitize(local_context_html).length
    return if count <= MAX_LOCAL_CONTEXT_CHARS

    errors.add(
      :local_context_html,
      "must be #{MAX_LOCAL_CONTEXT_CHARS} characters or fewer"
    )
  end
end

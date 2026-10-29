class Explainer < ApplicationRecord
  include HtmlSanitizeAttributes

  sanitizable :introduction_html, :before_you_apply_html

  belongs_to :requirement_template
  has_many :documents,
           class_name: "ExplainerDocument",
           inverse_of: :explainer,
           dependent: :destroy
  has_many :related_template_links,
           -> { order(:position) },
           class_name: "ExplainerRelatedTemplate",
           inverse_of: :explainer,
           dependent: :destroy
  has_many :related_templates,
           through: :related_template_links,
           source: :requirement_template
  accepts_nested_attributes_for :documents, allow_destroy: true

  before_validation :clean_content
  after_save :sync_related_templates

  validate :introduction_present_when_published
  validate :steps_have_title_and_description

  def published?
    published_at.present?
  end

  def publish=(value)
    return if value.nil?

    self.published_at =
      if ActiveModel::Type::Boolean.new.cast(value)
        published_at || Time.current
      else
        nil
      end
  end

  def related_template_ids
    return @related_template_id_list if defined?(@related_template_id_list)

    related_template_links.pluck(:requirement_template_id)
  end

  def related_template_ids=(ids)
    @related_template_id_list = allowed_related_template_ids(ids)
  end

  private

  def introduction_present_when_published
    return unless published?
    return unless Note.tiptap_blank?(introduction_html)

    errors.add(
      :base,
      "Page title and introduction is required before this can be published"
    )
  end

  def steps_have_title_and_description
    incomplete =
      Array(steps).any? do |step|
        step = step.to_h.with_indifferent_access
        step[:title].to_s.strip.blank? || step[:description].to_s.strip.blank?
      end
    return unless incomplete

    errors.add(:base, "Each step needs a title and a description")
  end

  def clean_content
    self.introduction_html = collapse_blank_html(introduction_html)
    self.before_you_apply_html = collapse_blank_html(before_you_apply_html)
    self.steps = clean_steps(steps)
    self.links = clean_links(links)
  end

  def collapse_blank_html(html)
    Note.tiptap_blank?(html) ? "" : html.to_s
  end

  def clean_steps(steps)
    Array(steps).filter_map do |step|
      step = step.to_h.with_indifferent_access
      title = step[:title].to_s.strip
      description = step[:description].to_s.strip
      next if title.blank? && description.blank?

      { "title" => title, "description" => description }
    end
  end

  def clean_links(links)
    Array(links).filter_map do |link|
      link = link.to_h.with_indifferent_access
      url = link[:url].to_s.strip
      next unless url.match?(%r{\Ahttps?://\S+\z}i)

      title = link[:title].to_s.strip
      { "title" => title.presence || url, "url" => url }
    end
  end

  def allowed_related_template_ids(ids)
    requested = Array(ids).map(&:to_s).uniq
    return [] if requested.empty?

    allowed =
      RequirementTemplate
        .kept
        .with_published_version
        .where(id: requested)
        .where.not(id: requirement_template_id)
        .pluck(:id)
        .map(&:to_s)
    requested.select { |id| allowed.include?(id) }
  end

  def sync_related_templates
    return unless defined?(@related_template_id_list)

    ids = @related_template_id_list
    if ids.empty?
      related_template_links.destroy_all
    else
      related_template_links.where.not(requirement_template_id: ids).destroy_all
      ids.each_with_index do |template_id, index|
        link =
          related_template_links.find_or_initialize_by(
            requirement_template_id: template_id
          )
        link.position = index
        link.save!
      end
    end

    remove_instance_variable(:@related_template_id_list)
    related_template_links.reset
  end
end

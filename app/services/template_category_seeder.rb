class TemplateCategorySeeder
  CATEGORY_LABELS = [
    "New construction",
    "Renovation",
    "Trades",
    "Structures",
    "Site",
    "Planning",
    "Other",
    "Occupancy"
  ].freeze

  TAG_CATEGORY_MAPPING = {
    "new construction" => "New construction",
    "renovation" => "Renovation",
    "renovation, alteration, or addition" => "Renovation",
    "addition alteration renovation" => "Renovation",
    "trades" => "Trades",
    "mechanical" => "Trades",
    "plumbing" => "Trades",
    "electrical" => "Trades",
    "gas" => "Trades",
    "solid fuel burning appliance" => "Trades",
    "fire alarm" => "Trades",
    "fire suppression" => "Trades",
    "structures" => "Structures",
    "buildings and structures" => "Structures",
    "manufactured home" => "Structures",
    "site" => "Site",
    "site preparation" => "Site",
    "site alteration" => "Site",
    "demolition" => "Site",
    "tree-cutting and tree removal" => "Site",
    "retaining wall" => "Site",
    "relocation" => "Site",
    "planning" => "Planning",
    "occupancy" => "Occupancy"
  }.freeze

  NICKNAME_CATEGORY = {
    "Small Complete Template" => "New construction",
    "Large Part 9 Template" => "New construction",
    "Large Part 3 Template" => "Structures",
    "New Construction - Small Scale" => "New construction",
    "New Construction - 4+ Unit" => "New construction",
    "Demolition - Small Scale" => "Site",
    "Demolition - 4+ Unit" => "Site"
  }.freeze

  def self.seed!
    new.seed!
  end

  def seed!
    categories = ensure_categories!
    assign_templates!(categories)
    RequirementTemplate.reindex
  end

  private

  def ensure_categories!
    CATEGORY_LABELS.each_with_index.to_h do |label, index|
      category = TemplateCategory.find_or_initialize_by(label: label)
      category.save!
      category.insert_at(index)
      [label, category]
    end
  end

  def assign_templates!(categories)
    sort_order_by_category_id = Hash.new(0)

    RequirementTemplate.find_each do |template|
      category =
        categories.fetch(
          category_label_for(template.tag_list, template.nickname)
        )
      sort_order = sort_order_by_category_id[category.id]

      template.update_columns(
        template_category_id: category.id,
        sort_order: sort_order,
        updated_at: Time.current
      )

      sort_order_by_category_id[category.id] = sort_order + 1
    end
  end

  def category_label_for(tag_list, nickname = nil)
    normalized_tags = tag_list.map { |tag| normalize_tag(tag) }

    CATEGORY_LABELS.each do |label|
      return label if normalized_tags.include?(normalize_tag(label))
    end

    normalized_tags.each do |tag|
      mapped_label = TAG_CATEGORY_MAPPING[tag]
      return mapped_label if mapped_label.present?
    end

    NICKNAME_CATEGORY[nickname] || "Other"
  end

  def normalize_tag(tag)
    tag.to_s.tr("_", " ").squish.downcase
  end
end

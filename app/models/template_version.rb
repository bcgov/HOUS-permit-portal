class TemplateVersion < ApplicationRecord
  include TraverseDataJson
  belongs_to :requirement_template
  has_many :jurisdiction_template_version_customizations
  has_many :permit_applications

  delegate :permit_type, to: :requirement_template
  delegate :activity, to: :requirement_template

  enum status: { scheduled: 0, published: 1, deprecated: 2 }, _default: 0

  after_save :reindex_requirement_template_if_published, if: :status_changed?

  def label
    "#{permit_type.name} #{activity.name} (#{version_date.to_s})"
  end

  def lookup_props
    # form_json starts at root template
    flatten_requirements_from_form_hash(form_json)
  end

  def form_json_requirements
    json_requirements = []
    requirement_blocks_json.each_pair do |block_id, block_json|
      block_json["requirements"].each do |requirement|
        dup_requirement = requirement.dup

        dup_requirement["requirement_block_id"] = block_id

        json_requirements.push(dup_requirement)
      end
    end

    json_requirements
  end

  private

  def reindex_requirement_template_if_published
    reindex_requirement_template if published?
  end

  def reindex_requirement_template
    requirement_template.reindex
  end
end

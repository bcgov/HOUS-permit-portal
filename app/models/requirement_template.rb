class RequirementTemplate < ApplicationRecord
  searchkick searchable: %i[description current_version permit_type activity],
             word_start: %i[description current_version permit_type activity],
             text_middle: %i[current_version description]

  belongs_to :activity
  belongs_to :permit_type

  has_many :requirement_template_sections, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_blocks, through: :requirement_template_sections
  has_many :requirements, through: :requirement_blocks
  has_many :template_versions, -> { order(version_date: :desc) }, dependent: :destroy
  has_many :scheduled_template_versions,
           -> { where(template_versions: { status: "scheduled" }).order(version_date: :desc) },
           class_name: "TemplateVersion"
  has_many :jurisdiction_template_version_customizations

  has_one :published_template_version, -> { where(status: "published") }, class_name: "TemplateVersion"

  # Scope to get RequirementTemplates with a published template version
  scope :with_published_version, -> { joins(:published_template_version) }

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at

  include Discard::Model

  accepts_nested_attributes_for :requirement_template_sections, allow_destroy: true

  validate :unique_permit_and_activity_for_undiscarded, on: :create

  def key
    "requirementtemplate#{id}"
  end

  def to_form_json
    {
      id: id,
      key: key,
      input: false,
      tableView: false,
      components:
        requirement_template_sections.map(&:to_form_json).concat(
          [
            {
              id: "section-completion-id",
              key: "section-completion-key",
              type: "container",
              title: I18n.t("formio.requirement_template.completion_title"),
              label: I18n.t("formio.requirement_template.completion_title"),
              custom_class: "formio-section-container",
              hide_label: false,
              collapsible: false,
              initially_collapsed: false,
              components: [
                id: "section-signoff-id",
                key: "section-signoff-key",
                type: "panel",
                title: I18n.t("formio.requirement_template.signoff_panel_title"),
                collapsible: true,
                collapsed: false,
                components: [
                  {
                    type: "checkbox",
                    key: "signed",
                    title: I18n.t("formio.requirement_template.signoff_checkbox_title"),
                    label: I18n.t("formio.requirement_template.signoff_checkbox_label"),
                    inputType: "checkbox",
                    input: true,
                    defaultValue: false,
                  },
                  {
                    key: "submit",
                    size: "md",
                    type: "button",
                    block: false,
                    input: true,
                    title: I18n.t("formio.requirement_template.signoff_submit_title"),
                    label: I18n.t("formio.requirement_template.signoff_submit_title"),
                    theme: "primary",
                    action: "submit",
                    widget: {
                      type: "input",
                    },
                    disabled: false,
                    show: false,
                    conditional: {
                      show: true,
                      when: "signed",
                      eq: "true",
                    },
                  },
                ],
              ],
            },
          ],
        ),
    }
  end

  def self.published_requirement_template_version(activity, permit_type)
    find_by(activity: activity, permit_type: permit_type).published_template_version
  rescue NoMethodError => e
    rails.logger.error e.message
  end

  def lookup_props
    array_of_req_pairs = requirement_template_sections.map(&:lookup_props).flatten
    array_of_req_pairs.reduce({}) do |obj, pair|
      key, value = pair.flatten
      obj.merge({ key => value })
    end
  end

  def search_data
    {
      description: description,
      current_version: published_template_version&.version_date,
      permit_type: permit_type.name,
      activity: activity.name,
      discarded: discarded_at.present?,
    }
  end

  private

  def unique_permit_and_activity_for_undiscarded
    existing_record =
      RequirementTemplate.find_by(permit_type_id: permit_type_id, activity_id: activity_id, discarded_at: nil)
    if existing_record.present?
      errors.add(:base, "There can only be one Requirement Template per permit_type and activity combination")
    end
  end

  def refresh_search_index
    RequirementTemplate.search_index.refresh
  end
end

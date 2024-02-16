class RequirementTemplate < ApplicationRecord
  searchkick searchable: %i[description status version permit_type activity],
             word_start: %i[description status version permit_type activity],
             text_middle: %i[version description]

  belongs_to :activity
  belongs_to :permit_type

  has_many :requirement_template_sections, -> { order(position: :asc) }, dependent: :destroy
  has_many :jurisdiction_requirement_templates
  has_many :jurisdictions, through: :jurisdiction_requirement_templates

  validate :scheduled_for_presence_if_scheduled

  before_create :set_default_version
  after_commit :refresh_search_index, if: :saved_change_to_discarded_at

  enum status: { draft: 0, scheduled: 1, published: 2 }, _default: 0

  include Discard::Model

  accepts_nested_attributes_for :requirement_template_sections, allow_destroy: true

  def jurisdictions_size
    jurisdictions.size
  end

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
      status: status,
      version: version,
      permit_type: permit_type.name,
      activity: activity.name,
      discarded: discarded_at.present?,
    }
  end

  private

  def refresh_search_index
    RequirementTemplate.search_index.refresh
  end

  def scheduled_for_presence_if_scheduled
    errors.add(:scheduled_for, "must be set when status is 'scheduled'") if scheduled? && scheduled_for.blank?
  end

  def set_default_version
    self.version ||= "v. #{Date.today.strftime("%Y.%m.%d")}"
  end
end

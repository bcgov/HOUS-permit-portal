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
    # TODO: Update content into en.yml
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
              title: "Completion",
              label: "Completion",
              custom_class: "formio-section-container",
              hide_label: false,
              collapsible: false,
              initially_collapsed: false,
              components: [
                id: "section-signoff-id",
                key: "section-signoff-key",
                type: "panel",
                title: "Sign and Submit",
                collapsible: true,
                collapsed: false,
                components: [
                  {
                    type: "checkbox",
                    key: "signed",
                    title: "Sign Off",
                    label:
                      "Lorem Ipsum I hereby certify that the information provided in this application is true, complete, and accurate to the best of my knowledge and belief. By checking this box, I am electronically signing this application and agree to abide by the terms and conditions of the permit and all applicable laws and regulations.",
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
                    title: "Submit",
                    label: "Submit",
                    theme: "primary",
                    action: "submit",
                    widget: {
                      type: "input",
                    },
                    disabled: false, # Initially disabled, assuming client-side logic will enable it
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

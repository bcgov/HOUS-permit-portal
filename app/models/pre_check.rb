class PreCheck < ApplicationRecord
  include ProjectItem
  has_parent :permit_application

  DEFAULT_CHECKLIST = { "sections" => [] }.freeze

  searchkick word_middle: %i[title full_address cert_number]

  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :permit_application, optional: true
  has_one :permit_project, through: :permit_application

  attribute :checklist, default: -> { DEFAULT_CHECKLIST.deep_dup }

  before_validation :ensure_checklist_structure
  validate :permit_application_belongs_to_creator,
           if: -> { permit_application_id.present? }

  validates :checklist, presence: true

  delegate :permit_project_title, to: :permit_application, allow_nil: true

  def search_data
    {
      id: id,
      title: title,
      cert_number: cert_number,
      full_address: full_address,
      permit_date: permit_date,
      phase: phase,
      creator_id: creator_id,
      created_at: created_at,
      updated_at: updated_at,
      permit_project_id: permit_project&.id,
      jurisdiction_id: jurisdiction&.id,
      permit_application_id: permit_application_id
    }
  end

  private

  def ensure_checklist_structure
    self.checklist = DEFAULT_CHECKLIST.deep_dup if checklist.blank? ||
      !checklist.is_a?(Hash)
  end

  def permit_application_belongs_to_creator
    return if creator_id.blank?

    submitter_id = permit_application&.submitter_id
    return if submitter_id.nil? || submitter_id == creator_id

    errors.add(:permit_application, :invalid)
  end
end

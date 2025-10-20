class PreCheck < ApplicationRecord
  include ProjectItem
  include AASM
  has_parent :permit_application

  searchkick word_middle: %i[full_address certificate_no]

  attribute :service_partner, :integer
  enum :service_partner, { archistar: 0 }

  attribute :status, :integer
  enum :status, { draft: 0, submitted: 1, reviewed: 2 }

  aasm column: :status, enum: true do
    state :draft, initial: true
    state :submitted
    state :reviewed

    event :submit do
      transitions from: :draft, to: :submitted

      after { submit_to_archistar }
    end

    event :mark_reviewed do
      transitions from: :submitted, to: :reviewed
    end
  end

  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :permit_application, optional: true
  has_one :permit_project, through: :permit_application
  has_many :design_documents, dependent: :destroy, inverse_of: :pre_check

  accepts_nested_attributes_for :design_documents, allow_destroy: true

  validate :permit_application_belongs_to_creator,
           if: -> { permit_application_id.present? }
  validate :agreements_accepted_before_permit_type
  validate :agreements_accepted_before_design_documents
  validate :agreements_cannot_be_unaccepted
  validate :cannot_change_after_submission
  validate :cannot_unsubmit
  validate :all_required_fields_complete_before_submission

  validates :service_partner, presence: true
  validates :certificate_no, uniqueness: true, allow_nil: true

  delegate :permit_project_title, to: :permit_application, allow_nil: true

  # Helper to check if all required agreements have been accepted
  def required_agreements_accepted?
    eula_accepted && consent_to_send_drawings
  end

  def city_key
    # TODO: Implement city key
    "todo"
  end

  def primary_design_document
    design_documents.order(created_at: :desc).first
  end

  def latitude
    # TODO: Extract from geocoder data or site
    nil
  end

  def longitude
    # TODO: Extract from geocoder data or site
    nil
  end

  def submit_to_archistar
    archistar = Wrappers::Archistar.new
    archistar.create_submission(self)
  rescue => e
    Rails.logger.error("Archistar submission failed: #{e.message}")
    raise # This will rollback the AASM transition
  end

  def search_data
    {
      id: id,
      certificate_no: certificate_no,
      full_address: full_address,
      status: status,
      service_partner: service_partner,
      creator_id: creator_id,
      created_at: created_at,
      updated_at: updated_at,
      permit_project_id: permit_project&.id,
      jurisdiction_id: jurisdiction&.id,
      permit_application_id: permit_application_id
    }
  end

  private

  def permit_application_belongs_to_creator
    return if creator_id.blank?

    submitter_id = permit_application&.submitter_id
    return if submitter_id.nil? || submitter_id == creator_id

    errors.add(:permit_application, :invalid)
  end

  def agreements_accepted_before_permit_type
    return unless permit_type_id.present?
    return if required_agreements_accepted?

    errors.add(
      :permit_type_id,
      "cannot be set until EULA and consent to send drawings are accepted"
    )
  end

  def agreements_accepted_before_design_documents
    return unless design_documents.any?
    return if required_agreements_accepted?

    errors.add(
      :base,
      "Design documents cannot be added until EULA and consent to send drawings are accepted"
    )
  end

  def agreements_cannot_be_unaccepted
    if eula_accepted_changed?(from: true, to: false)
      errors.add(:eula_accepted, "cannot be revoked once accepted")
    end

    if consent_to_send_drawings_changed?(from: true, to: false)
      errors.add(:consent_to_send_drawings, "cannot be revoked once accepted")
    end
  end

  def cannot_change_after_submission
    return unless persisted? && (submitted? || reviewed?)

    # Fields that cannot be changed after submission
    locked_fields = %w[
      full_address
      jurisdiction_id
      permit_type_id
      service_partner
      eula_accepted
      consent_to_send_drawings
      consent_to_share_with_jurisdiction
      consent_to_research_contact
    ]

    locked_fields.each do |field|
      if changed.include?(field)
        errors.add(field.to_sym, "cannot be changed after submission")
      end
    end

    # Check if design documents are being modified
    if design_documents.any? { |doc|
         doc.new_record? || doc.marked_for_destruction?
       }
      errors.add(:design_documents, "cannot be modified after submission")
    end
  end

  def cannot_unsubmit
    if status_changed? && status_was.in?(%w[submitted reviewed]) &&
         status == "draft"
      errors.add(:status, "cannot be reverted to draft after submission")
    end
  end

  def all_required_fields_complete_before_submission
    # This validation runs during AASM transition via before_validation
    # Only check if we're trying to transition to submitted status
    return unless status == "submitted" && status_changed?

    missing_fields = []

    missing_fields << "service partner" unless service_partner.present?
    missing_fields << "address" unless full_address.present?
    missing_fields << "jurisdiction" unless jurisdiction_id.present?
    missing_fields << "EULA acceptance" unless eula_accepted
    missing_fields << "consent to send drawings" unless consent_to_send_drawings
    missing_fields << "permit type" unless permit_type_id.present?
    missing_fields << "design documents" unless design_documents.any?

    if missing_fields.any?
      errors.add(
        :base,
        "Cannot submit pre-check. Missing required fields: #{missing_fields.join(", ")}"
      )
    end
  end
end

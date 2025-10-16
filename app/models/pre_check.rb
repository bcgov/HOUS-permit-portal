class PreCheck < ApplicationRecord
  include ProjectItem
  has_parent :permit_application

  searchkick word_middle: %i[full_address cert_number]

  attribute :service_partner, :integer
  enum :service_partner, { archistar: 0 }

  attribute :status, :integer
  enum :status, { draft: 0, submitted: 1, reviewed: 2 }

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

  delegate :permit_project_title, to: :permit_application, allow_nil: true

  # Helper to check if all required agreements have been accepted
  def required_agreements_accepted?
    eula_accepted && consent_to_send_drawings
  end

  def search_data
    {
      id: id,
      cert_number: cert_number,
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
    return unless persisted? && is_submitted_was == true

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
    if is_submitted_changed?(from: true, to: false)
      errors.add(:is_submitted, "cannot be revoked once submitted")
    end
  end

  def all_required_fields_complete_before_submission
    unless is_submitted == true && !persisted? ||
             is_submitted_changed?(to: true)
      return
    end

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

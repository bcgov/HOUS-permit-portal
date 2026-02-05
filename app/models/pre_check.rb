class PreCheck < ApplicationRecord
  include ProjectItem
  include AASM
  include PublicRecordable
  has_parent :permit_application

  searchkick word_middle: %i[full_address external_id]

  attribute :service_partner, :integer
  enum :service_partner, { archistar: 0 }

  attribute :status, :integer
  enum :status, { draft: 0, processing: 1, complete: 2 }
  enum :assessment_result, { passed: 0, failed: 1 }

  aasm column: :status, enum: true do
    state :draft, initial: true
    state :processing
    state :complete

    event :submit do
      transitions from: :draft, to: :processing, guard: :can_submit?

      after do
        submit_to_archistar
        NotificationService.publish_pre_check_submitted_event(self)
      end
    end

    event :mark_complete do
      transitions from: :processing, to: :complete

      before do |assessment_result_value|
        self.assessment_result =
          assessment_result_value if assessment_result_value.present?
      end
    end
  end

  belongs_to :creator,
             class_name: "User",
             foreign_key: "creator_id",
             optional: true
  public_recordable user_association: :creator
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
  validate :assessment_result_only_when_complete

  validates :service_partner, presence: true
  validates :external_id, uniqueness: true, allow_nil: true

  scope :completed_and_unviewed, -> { where(status: :complete, viewed_at: nil) }

  delegate :permit_project_title, to: :permit_application, allow_nil: true

  def self.unviewed_count_for_user(user_id)
    completed_and_unviewed.where(creator_id: user_id).count
  end

  # Helper to check if all required agreements have been accepted
  def required_agreements_accepted?
    eula_accepted && consent_to_send_drawings
  end

  def city_key
    "bcbc"
  end

  def primary_design_document
    design_documents.order(created_at: :desc).first
  end

  def latitude
    coordinates&.last
  end

  def longitude
    coordinates&.first
  end

  def coordinates
    return @coordinates if defined?(@coordinates)

    @coordinates =
      if pid.present?
        begin
          Wrappers::LtsaParcelMapBc.new.get_coordinates_by_pid(pid)
        rescue => e
          Rails.logger.warn(
            "Failed to fetch coordinates for PID #{pid}: #{e.message}"
          )
          nil
        end
      else
        nil
      end
  end

  def submit_to_archistar
    archistar = Wrappers::Archistar.new
    ext_id = archistar.create_submission(self)
    self.update(external_id: ext_id, submitted_at: Time.current)
  rescue => e
    Rails.logger.error("Archistar submission failed: #{e.message}")
    raise # This will rollback the AASM transition
  end

  def formatted_address
    return nil if full_address.blank?

    # Split the address into parts
    # Expected format: "Street Address, City, Province"
    parts = full_address.split(",").map(&:strip)

    if parts.length >= 2
      street_address = parts[0]
      city = parts[1]

      # If we have a third part (province), we might need to handle it
      # For now, just use street address and city
      "#{street_address}, #{city}"
    else
      # Fallback to the original address if it doesn't match expected format
      full_address
    end
  end

  def comply_certificate_id
    if permit_type&.code == "low_residential"
      152
    else
      nil
    end
  end

  def search_data
    {
      id: id,
      external_id: external_id,
      full_address: full_address,
      pid: pid,
      status: status,
      title: title,
      service_partner: service_partner,
      creator_id: creator_id,
      created_at: created_at,
      updated_at: updated_at,
      permit_project_id: permit_project&.id,
      jurisdiction_id: jurisdiction&.id,
      permit_application_id: permit_application_id
    }
  end

  def submission_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::PRE_CHECK_SUBMITTED,
      "action_text" =>
        I18n.t("notification.pre_check.submitted", address: full_address),
      "object_data" => {
        "pre_check_id" => id,
        "external_id" => external_id,
        "full_address" => full_address
      }
    }
  end

  def completed_event_notification_data
    action_text_key =
      if assessment_result == "passed"
        "notification.pre_check.completed_passed"
      else
        "notification.pre_check.completed_failed"
      end

    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::PRE_CHECK_COMPLETED,
      "action_text" => I18n.t(action_text_key, address: full_address),
      "object_data" => {
        "pre_check_id" => id,
        "external_id" => external_id,
        "assessment_result" => assessment_result,
        "full_address" => full_address,
        "unviewed_count" => PreCheck.unviewed_count_for_user(creator_id)
      }
    }
  end

  def expired?
    return false unless created_at.present?

    created_at <= 150.days.ago
  end

  def can_submit?
    return false if service_partner.blank?

    if archistar?
      SiteConfiguration.archistar_enabled_for_jurisdiction?(jurisdiction)
    else
      false
    end
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
    return unless persisted? && (processing? || complete?)

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
    if status_changed? && status_was.in?(%w[processing complete]) &&
         status == "draft"
      errors.add(:status, "cannot be reverted to draft after submission")
    end
  end

  def all_required_fields_complete_before_submission
    # This validation runs during AASM transition via before_validation
    # Only check if we're trying to transition to processing status
    return unless status == "processing" && status_changed?

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

  def assessment_result_only_when_complete
    return if assessment_result.nil?
    return if complete?

    errors.add(:assessment_result, "can only be set when status is complete")
  end

  def public_record?
    false # Pre-checks are not public records until they are attached to a permit application - revist this after merging HUB-4112
  end
end

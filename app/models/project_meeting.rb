class ProjectMeeting < ApplicationRecord
  searchkick word_middle: %i[
               contact_name
               contact_email
               project_number
               project_address
               project_pid
               project_description
               meeting_notes
               status
             ]

  include ProjectMeetingStatus

  SEARCH_INCLUDES = %i[permit_project meeting_request_documents].freeze

  belongs_to :permit_project, inverse_of: :project_meetings
  belongs_to :requested_by, class_name: "User", inverse_of: :project_meetings

  include ProjectItem
  has_parent :permit_project

  has_many :meeting_request_documents, dependent: :destroy
  accepts_nested_attributes_for :meeting_request_documents, allow_destroy: true

  enum :requester_relationship,
       {
         owner_or_landholder: 0,
         leaseholder_or_tenant: 1,
         owners_representative: 2,
         other: 3
       },
       prefix: true

  validates :permit_project, :requested_by, :status, presence: true
  validates :contact_email,
            format: {
              with: URI::MailTo::EMAIL_REGEXP
            },
            allow_blank: true
  validates :contact_phone_number, phone: true, allow_blank: true
  validates :meeting_url,
            format: {
              with: URI::DEFAULT_PARSER.make_regexp(%w[http https])
            },
            allow_blank: true
  validate :validate_submission_requirements, if: :submitted?

  before_validation :normalize_contact_phone_number

  def feature_enabled?
    parent&.project_meetings_enabled?
  end

  def authorization_required?
    requester_relationship.present? &&
      !requester_relationship_owner_or_landholder?
  end

  def active_meeting_request_documents
    meeting_request_documents.reject(&:marked_for_destruction?)
  end

  def update_viewed_at
    return if viewed_at.present?

    update!(viewed_at: Time.current)
  end

  def mark_as_unviewed
    return if viewed_at.blank?

    update!(viewed_at: nil)
  end

  def submitted_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_text" =>
        I18n.t(
          "notification.project_meeting.submitted",
          project_number: permit_project&.number
        ),
      "action_type" =>
        Constants::NotificationActionTypes::PROJECT_MEETING_SUBMITTED,
      "object_data" => {
        "permit_project_id" => permit_project.id,
        "project_meeting_id" => id
      }
    }
  end

  def search_data
    {
      permit_project_id: permit_project_id,
      jurisdiction_id: jurisdiction_id,
      sandbox_id: sandbox_id,
      requested_by_id: requested_by_id,
      status: status,
      contact_name: contact_name,
      contact_email: contact_email,
      project_description: project_description,
      meeting_notes: meeting_notes,
      viewed_at: viewed_at,
      project_number: permit_project&.number,
      project_address: full_address,
      project_pid: pid,
      submitted_at: submitted_at,
      confirmed_date: confirmed_date,
      scheduled_at: scheduled_at,
      created_at: created_at,
      updated_at: updated_at,
      discarded: parent&.discarded_at.present?
    }
  end

  private

  def validate_submission_requirements
    %i[
      requester_relationship
      contact_name
      contact_email
      project_description
    ].each do |attribute|
      errors.add(attribute, :blank) if public_send(attribute).blank?
    end

    if request_property_information.nil?
      errors.add(:request_property_information, :blank)
    end

    if authorization_required? &&
         active_meeting_request_documents.none?(&:document_type_authorization?)
      errors.add(:meeting_request_documents, :authorization_required)
    end
  end

  def normalize_contact_phone_number
    return if contact_phone_number.blank?

    parsed = Phonelib.parse(contact_phone_number)
    self.contact_phone_number = parsed.e164 if parsed.valid?
  end
end

class ProjectMeeting < ApplicationRecord
  belongs_to :permit_project, inverse_of: :project_meetings
  belongs_to :requested_by, class_name: "User", inverse_of: :project_meetings

  has_many :meeting_request_documents, dependent: :destroy
  accepts_nested_attributes_for :meeting_request_documents, allow_destroy: true

  enum :status, { draft: 0, submitted: 1 }

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
  validate :submitted_fields_present, if: :submitted?

  before_validation :normalize_contact_phone_number
  after_commit :reindex_permit_project

  def submit_request!
    update!(status: :submitted, submitted_at: Time.current)
    permit_project.mark_as_unviewed
    PermitHubMailer.notify_project_meeting_submitted(self).deliver_later
  end

  def feature_enabled?
    permit_project.project_meetings_enabled?
  end

  private

  def submitted_fields_present
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
  end

  def normalize_contact_phone_number
    return if contact_phone_number.blank?

    parsed = Phonelib.parse(contact_phone_number)
    self.contact_phone_number = parsed.e164 if parsed.valid?
  end

  def reindex_permit_project
    permit_project&.reindex
  end
end

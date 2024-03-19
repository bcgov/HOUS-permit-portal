class PermitApplication < ApplicationRecord
  include FormSupportingDocuments
  include AutomatedComplianceUtils
  include StepCodeFieldExtraction
  include ZipfileUploader.Attachment(:zipfile)
  searchkick searchable: %i[number nickname full_address permit_classifications submitter status],
             word_start: %i[number nickname full_address permit_classifications submitter status]

  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction

  belongs_to :permit_type
  belongs_to :activity
  belongs_to :template_version

  # The front end form update provides a json paylioad of items we want to force update on the front-end since form io maintains its own state and does not 'rerender' if we send the form data back
  attr_accessor :front_end_form_update
  has_one :step_code

  has_many :supporting_documents, dependent: :destroy
  accepts_nested_attributes_for :supporting_documents, allow_destroy: true

  # Custom validation

  validate :submitter_must_have_role
  validate :jurisdiction_has_matching_submission_contact
  validates :nickname, presence: true
  validates :number, presence: true
  validates :reference_number, length: { maximum: 300 }, allow_nil: true

  enum status: { draft: 0, submitted: 1 }, _default: 0

  delegate :name, to: :jurisdiction, prefix: true
  delegate :code, :name, to: :permit_type, prefix: true
  delegate :code, :name, to: :activity, prefix: true
  delegate :energy_step_required, to: :jurisdiction, allow_nil: true
  delegate :zero_carbon_step_required, to: :jurisdiction, allow_nil: true
  delegate :form_json, to: :template_version

  before_validation :assign_default_nickname, on: :create
  before_validation :assign_unique_number, on: :create
  before_validation :set_template_version, on: :create
  before_save :set_submitted_at, if: :status_changed?
  before_save :take_form_customizations_snapshot_if_submitted

  after_commit :reindex_jurisdiction_permit_application_size
  after_commit :notify_user_application_updated
  after_save :zip_and_upload_supporting_documents, if: :saved_change_to_status?

  scope :unviewed, -> { where(status: :submitted, viewed_at: nil).order(submitted_at: :asc) }

  def force_update_published_template_version
    return unless Rails.env.development?
    # for development purposes only

    current_published_template_version.update(
      form_json: current_published_template_version.requirement_template.to_form_json,
    )
  end

  def search_data
    {
      number: number,
      nickname: nickname,
      permit_classifications: "#{permit_type.name} #{activity.name}",
      submitter: "#{submitter.name} #{submitter.email}",
      submitted_at: submitted_at,
      viewed_at: viewed_at,
      status: status,
      jurisdiction_id: jurisdiction.id,
      submitter_id: submitter.id,
      created_at: created_at,
    }
  end

  def set_template_version
    return unless template_version.blank?

    self.template_version = current_published_template_version
  end

  def current_published_template_version
    # this will eventually be different, if there is a new version it should notify the user
    RequirementTemplate.published_requirement_template_version(activity, permit_type)
  end

  def form_customizations
    if submitted?
      form_customizations_snapshot
    else
      jurisdiction
        .jurisdiction_template_version_customizations
        .find_by(template_version: template_version)
        &.customizations
    end
  end

  def number_prefix
    jurisdiction.prefix
  end

  def assign_default_nickname
    self.nickname = "#{jurisdiction_name}: #{full_address || pid || pin || id}" if self.nickname.blank?
  end

  def update_viewed_at
    update(viewed_at: Time.current)
  end

  def assign_unique_number
    last_number =
      jurisdiction
        .permit_applications
        .where("number LIKE ?", "#{number_prefix}-%")
        .order(Arel.sql("LENGTH(number) DESC"), number: :desc)
        .limit(1)
        .pluck(:number)
        .first

    # Notice that the last number comes from the specific jurisdiction

    if last_number
      number_parts = last_number.split("-")
      new_integer = number_parts[1..-1].join.to_i + 1 # Increment the sequence

      # the remainder of dividing any number by 1000 always gives the last 3 digits
      # Removing the last 3 digits (integer division by 1000), then taking the remainder above gives the middle 3
      # Removing the last 6 digits (division), then taking the remainder as above gives the first 3 digits

      # irb(main):008> 123456789 / 1_000
      # => 123456
      # irb(main):010> 123456 % 1000
      # => 456
      # irb(main):009> 123456789 / 1_000_000
      # => 123
      # irb(main):013> 123 % 1000
      # => 123

      # %03d pads with 0s
      new_number =
        format(
          "%s-%03d-%03d-%03d",
          number_prefix,
          new_integer / 1_000_000 % 1000,
          new_integer / 1000 % 1000,
          new_integer % 1000,
        )
    else
      # Start with the initial number if there are no previous numbers
      new_number = format("%s-001-000-000", number_prefix)
    end

    # Assign the new number to the permit application
    self.number = new_number if self.number.blank?
    return new_number
  end

  def zipfile_size
    zipfile_data&.dig("metadata", "size")
  end

  def zipfile_name
    zipfile_data&.dig("metadata", "filename")
  end

  def zipfile_url
    zipfile&.url(
      public: false,
      expires_in: 3600,
      response_content_disposition: "attachment; filename=\"#{zipfile.original_filename}\"",
    )
  end

  def submitter_frontend_url
    FrontendUrlHelper.frontend_url("/permit-applications/#{id}/edit")
  end

  def reviewer_frontend_url
    FrontendUrlHelper.frontend_url("/permit-applications/#{id}")
  end

  def days_ago_submitted
    # Calculate the difference in days between the current date and the submitted_at date
    (Date.current - submitted_at.to_date).to_i
  end

  def formatted_submitted_at
    submitted_at&.strftime("%Y-%m-%d")
  end

  def formatted_viewed_at
    viewed_at&.strftime("%Y-%m-%d")
  end

  def permit_type_and_activity
    "#{activity.name} - #{permit_type.name}".strip
  end

  def send_submit_notifications
    PermitHubMailer.notify_submitter_application_submitted(submitter, self).deliver_later
    jurisdiction.users.each { |user| PermitHubMailer.notify_reviewer_application_received(user, self).deliver_later }
  end

  private

  def take_form_customizations_snapshot_if_submitted
    return unless status_changed? && submitted?

    current_customizations =
      jurisdiction
        .jurisdiction_template_version_customizations
        .find_by(template_version: template_version)
        &.customizations

    return unless current_customizations.present?

    self.form_customizations_snapshot = current_customizations
  end

  def notify_user_application_updated
    return if new_record?

    return unless saved_change_to_viewed_at? || saved_change_to_reference_number?

    PermitHubMailer.notify_application_updated(submitter, self).deliver_later
  end

  def reindex_jurisdiction_permit_application_size
    return unless jurisdiction.present?
    return unless new_record? || destroyed? || saved_change_to_jurisdiction_id?

    jurisdiction.reindex
  end

  def zip_and_upload_supporting_documents
    return unless submitted? && zipfile_data.blank?

    ZipfileJob.perform_async(id)
  end

  def set_submitted_at
    # Check if the status changed to 'submitted' and `submitted_at` is nil to avoid overwriting the timestamp.
    self.submitted_at = Time.current if submitted? && submitted_at.nil?
  end

  def submitter_must_have_role
    unless submitter&.submitter?
      errors.add(:submitter, I18n.t("errors.models.permit_application.attributes.submitter.incorrect_role"))
    end
  end

  def jurisdiction_has_matching_submission_contact
    matching_contacts = PermitTypeSubmissionContact.where(jurisdiction: jurisdiction, permit_type: permit_type)
    if matching_contacts.empty?
      errors.add(
        :jurisdiction,
        I18n.t("activerecord.errors.models.permit_application.attributes.jurisdiction.no_contact"),
      )
    end
  end
end

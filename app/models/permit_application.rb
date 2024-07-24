class PermitApplication < ApplicationRecord
  include FormSupportingDocuments
  include AutomatedComplianceUtils
  include StepCodeFieldExtraction
  include ZipfileUploader.Attachment(:zipfile)
  include PermitApplicationStatus

  SEARCH_INCLUDES = %i[permit_type submission_versions step_code activity jurisdiction submitter]

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
  has_many :submission_versions, dependent: :destroy

  scope :submitted, -> { joins(:submission_versions).distinct }

  # Custom validation

  validate :jurisdiction_has_matching_submission_contact
  validate :pid_or_pin_presence
  validates :nickname, presence: true
  validates :number, presence: true
  validates :reference_number, length: { maximum: 300 }, allow_nil: true

  delegate :qualified_name, to: :jurisdiction, prefix: true
  delegate :name, to: :jurisdiction, prefix: true
  delegate :code, :name, to: :permit_type, prefix: true
  delegate :code, :name, to: :activity, prefix: true
  delegate :published_template_version, to: :template_version

  before_validation :assign_default_nickname, on: :create
  before_validation :assign_unique_number, on: :create
  before_validation :set_template_version, on: :create
  before_validation :populate_base_form_data, on: :create
  before_save :take_form_customizations_snapshot_if_submitted

  after_commit :reindex_jurisdiction_permit_application_size
  after_commit :zip_and_upload_supporting_documents, if: :saved_change_to_status?
  after_commit :send_submitted_webhook, if: :saved_change_to_status?
  after_commit :notify_user_reference_number_updated, if: :saved_change_to_reference_number?

  scope :unviewed, -> { where(status: :submitted, viewed_at: nil).order(submitted_at: :asc) }

  # Helper method to get the latest SubmissionVersion
  def latest_submission_version
    submission_versions.order(created_at: :desc).first
  end

  def earliest_submission_version
    submission_versions.order(created_at: :desc).last
  end

  # Method to get all revision requests from the latest SubmissionVersion
  def revision_requests
    latest_submission_version&.revision_requests || RevisionRequest.none
  end

  def form_json
    result = PermitApplication::FormJsonService.new(permit_application: self).call
    result.form_json
  end

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
      template_version_id: template_version.id,
      requirement_template_id: template_version.requirement_template.id,
      created_at: created_at,
      using_current_template_version: using_current_template_version,
    }
  end

  def indexed_using_current_template_version
    self.class.searchkick_index.retrieve(self)["using_current_template_version"]
  end

  def formatted_permit_classifications
    "#{permit_type.name} - #{activity.name}"
  end

  def using_current_template_version
    self.template_version === current_published_template_version
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

  def update_viewed_at
    latest_submission_version.update(viewed_at: Time.current)
  end

  def number_prefix
    jurisdiction.prefix
  end

  def collaborators
    relevant_collaborators = [submitter]

    if submitted?
      relevant_collaborators =
        relevant_collaborators + jurisdiction.review_managers if jurisdiction.review_managers.present?
      relevant_collaborators =
        relevant_collaborators + jurisdiction.regional_review_managers if jurisdiction.regional_review_managers.present?
      relevant_collaborators = relevant_collaborators + jurisdiction.reviewers if jurisdiction.reviewers.present?
    end

    relevant_collaborators
  end

  def set_template_version
    return unless template_version.blank?

    self.template_version = current_published_template_version
  end

  def populate_base_form_data
    self.submission_data = { data: {} }
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

  def formatted_revisions_requested_at
    revisions_requested_at&.strftime("%Y-%m-%d")
  end

  def formatted_resubmitted_at
    resubmitted_at&.strftime("%Y-%m-%d")
  end

  def permit_type_and_activity
    "#{activity.name} - #{permit_type.name}".strip
  end

  def confirmed_permit_type_submission_contacts
    jurisdiction.permit_type_submission_contacts.where(permit_type: permit_type).where.not(confirmed_at: nil)
  end

  def send_submit_notifications
    # All submission related emails and in-app notifications are handled by this method
    NotificationService.publish_application_submission_event(self)
    confirmed_permit_type_submission_contacts.each do |permit_type_submission_contact|
      PermitHubMailer.notify_reviewer_application_received(permit_type_submission_contact, self).deliver_later
    end
  end

  def formatted_submission_data_for_external_use
    ExternalPermitApplicationService.new(self).formatted_submission_data_for_external_use
  end

  def formatted_raw_h2k_files_for_external_use
    ExternalPermitApplicationService.new(self).get_raw_h2k_files
  end

  def send_submitted_webhook
    return unless submitted?

    jurisdiction
      .active_external_api_keys
      .where.not(webhook_url: [nil, ""]) # Only send webhooks to keys with a webhook URL
      .each { |external_api_key| PermitWebhookJob.perform_async(external_api_key.id, "permit_submitted", id) }
  end

  def missing_pdfs
    return [] unless submitted?

    missing_pdfs = []

    application_pdf = supporting_documents.find_by(data_key: PERMIT_APP_PDF_DATA_KEY)

    missing_pdfs << PERMIT_APP_PDF_DATA_KEY if application_pdf.blank?

    return missing_pdfs unless step_code&.pre_construction_checklist

    checklist_pdf = supporting_documents.find_by(data_key: CHECKLIST_PDF_DATA_KEY)
    missing_pdfs << CHECKLIST_PDF_DATA_KEY if checklist_pdf.blank?

    missing_pdfs
  end

  def viewed_at
    latest_submission_version&.viewed_at
  end

  def submitted_at
    return nil if submission_versions.length < 1
    return earliest_submission_version.created_at
  end

  def resubmitted_at
    return nil if submission_versions.length <= 1
    return latest_submission_version.created_at
  end

  def submit_event_notification_data
    i18n_key =
      (
        if resubmitted_at.present?
          "notification.permit_application.resubmission_notification"
        else
          "notification.permit_application.submission_notification"
        end
      )

    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::APPLICATION_SUBMISSION,
      "action_text" => "#{I18n.t(i18n_key, number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id,
      },
    }
  end

  def revisions_request_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::APPLICATION_REVISIONS_REQUEST,
      "action_text" =>
        "#{I18n.t("notification.permit_application.revisions_request_notification", number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id,
        "permit_application_number" => number,
      },
    }
  end

  def application_view_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::APPLICATION_VIEW,
      "action_text" =>
        "#{I18n.t("notification.permit_application.view_notification", number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id,
      },
    }
  end

  def application_reference_updated_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::APPLICATION_REFERENCE_UPDATED,
      "action_text" =>
        "#{I18n.t("notification.permit_application.reference_updated_notification", number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id,
      },
    }
  end

  def step_code_requirements
    jurisdiction.permit_type_required_steps.where(permit_type_id:)
  end

  def energy_step_code_required?
    custom_requirements = step_code_requirements.customizations

    custom_requirements.empty? || custom_requirements.any? { |r| r.energy_step_required || r.zero_carbon_step_required }
  end

  private

  def assign_default_nickname
    self.nickname = "#{jurisdiction_qualified_name}: #{full_address || pid || pin || id}" if self.nickname.blank?
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

  def notify_user_reference_number_updated
    return if new_record?
    NotificationService.publish_application_view_event(self)
  end

  def reindex_jurisdiction_permit_application_size
    return unless jurisdiction.present?
    return unless new_record? || destroyed? || saved_change_to_jurisdiction_id?

    jurisdiction.reindex
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

  def pid_or_pin_presence
    if pin.blank? && pid.blank?
      errors.add(:base, I18n.t("activerecord.errors.models.permit_application.attributes.pid_or_pin"))
    end
  end
end

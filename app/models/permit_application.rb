class PermitApplication < ApplicationRecord
  include FormSupportingDocuments
  include AutomatedComplianceUtils
  include StepCodeFieldExtraction
  include ZipfileUploader.Attachment(:zipfile)
  include PermitApplicationStatus

  SEARCH_INCLUDES = %i[permit_type submission_versions step_code activity jurisdiction submitter permit_collaborations]

  searchkick word_middle: %i[nickname full_address permit_classifications submitter status review_delegatee_name],
             text_end: %i[number]

  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction
  belongs_to :permit_type
  belongs_to :activity
  belongs_to :template_version

  # The front end form update provides a json paylioad of items we want to force update on the front-end since form io maintains its own state and does not 'rerender' if we send the form data back
  attr_accessor :front_end_form_update
  has_one :step_code
  has_many :submission_versions, dependent: :destroy
  has_many :permit_collaborations, dependent: :destroy
  has_many :collaborators, through: :permit_collaborations
  has_many :permit_block_statuses, dependent: :destroy

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
  after_commit :send_submitted_webhook, if: :saved_change_to_status?
  after_commit :notify_user_reference_number_updated, if: :saved_change_to_reference_number?

  scope :with_submitter_role, -> { joins(:submitter).where(users: { role: "submitter" }) }

  scope :unviewed, -> { where(status: :submitted, viewed_at: nil).order(submitted_at: :asc) }

  COMPLETION_SECTION_KEY = "section-completion-key"

  def supporting_documents_for_submitter_based_on_user_permissions(supporting_documents, user: nil)
    return supporting_documents if user.blank?

    permissions = submission_requirement_block_edit_permissions(user_id: user.id)

    return supporting_documents if permissions == :all

    return [] if permissions.blank?

    supporting_documents.select do |s|
      return false if s.data_key.blank?

      rb_id = s.data_key[/RB([a-zA-Z0-9\-]+)/, 1]

      permissions.include?(rb_id)
    end
  end

  def formatted_submission_data(current_user: nil)
    PermitApplication::SubmissionDataService.new(self).formatted_submission_data(current_user: current_user)
  end

  def users_by_collaboration_options(collaboration_type:, collaborator_type: nil, assigned_requirement_block_id: nil)
    base_where_clause = {
      collaborations: {
        permit_collaborations: {
          collaboration_type: collaboration_type,
          permit_application_id: id,
        },
      },
    }

    base_where_clause[:collaborations][:permit_collaborations][
      :collaborator_type
    ] = collaborator_type if collaborator_type.present?

    base_where_clause[:collaborations][:permit_collaborations][
      :assigned_requirement_block_id
    ] = assigned_requirement_block_id if assigned_requirement_block_id.present?

    User.joins(collaborations: :permit_collaborations).where(base_where_clause).distinct
  end

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

  def form_json(current_user: nil)
    result = PermitApplication::FormJsonService.new(permit_application: self, current_user:).call
    result.form_json
  end

  def force_update_published_template_version
    return unless Rails.env.development?
    # for development purposes only

    current_published_template_version.update(
      form_json: current_published_template_version.requirement_template.to_form_json,
    )
  end

  def update_with_submission_data_merge(permit_application_params:, current_user: nil)
    PermitApplication::SubmissionDataService.new(self).update_with_submission_data_merge(
      permit_application_params:,
      current_user:,
    )
  end

  def search_data
    {
      number: number,
      nickname: nickname,
      permit_classifications: "#{permit_type.name} #{activity.name}",
      submitter: "#{submitter.name} #{submitter.email}",
      submitted_at: submitted_at,
      resubmitted_at: resubmitted_at,
      viewed_at: viewed_at,
      status: status,
      jurisdiction_id: jurisdiction.id,
      submitter_id: submitter.id,
      template_version_id: template_version.id,
      requirement_template_id: template_version.requirement_template.id,
      created_at: created_at,
      using_current_template_version: using_current_template_version,
      user_ids_with_submission_edit_permissions:
        [submitter.id] + users_by_collaboration_options(collaboration_type: :submission).pluck(:id),
      review_delegatee_name:
        users_by_collaboration_options(collaboration_type: :review, collaborator_type: :delegatee).first&.name,
    }
  end

  def collaborator?(user_id:, collaboration_type:, collaborator_type: nil)
    users_by_collaboration_options(collaboration_type:, collaborator_type:).exists?(id: user_id)
  end

  def submission_requirement_block_edit_permissions(user_id:)
    return nil if submitter_id != user_id && !collaborator?(user_id:, collaboration_type: :submission)

    if submitter_id == user_id ||
         collaborator?(user_id:, collaboration_type: :submission, collaborator_type: :delegatee)
      return :all
    end

    permit_collaborations
      .joins(:collaborator)
      .where(collaboration_type: :submission, collaborators: { user_id: })
      .map(&:assigned_requirement_block_id)
      .compact
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
    RequirementTemplate.published_requirement_template_version(activity, permit_type, first_nations)
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
    reindex
  end

  def number_prefix
    jurisdiction.prefix
  end

  def notifiable_users
    relevant_collaborators = [submitter]
    designated_submitter =
      users_by_collaboration_options(collaboration_type: :submission, collaborator_type: :delegatee).first

    relevant_collaborators << designated_submitter if designated_submitter.present?

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
      .each do |external_api_key|
        PermitWebhookJob.perform_async(
          external_api_key.id,
          (
            if newly_submitted?
              Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED
            else
              Constants::Webhooks::Events::PermitApplication::PERMIT_RESUBMITTED
            end
          ),
          id,
        )
      end
  end

  def missing_pdfs
    return [] unless submitted?

    missing_pdfs = []

    submission_versions.each do |submission_version|
      version_missing_pdfs = submission_version.missing_pdfs

      next if version_missing_pdfs.empty?

      missing_pdfs += version_missing_pdfs
    end

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

  def self.count_by_jurisdiction_and_status
    # Perform a single query to aggregate counts grouped by jurisdiction_id and status
    counts =
      PermitApplication.joins(:submitter).where(users: { role: "submitter" }).group(:jurisdiction_id, :status).count

    # Organize counts by jurisdiction_id
    jurisdiction_counts =
      counts.each_with_object(Hash.new { |h, k| h[k] = {} }) do |((jurisdiction_id, status), count), acc|
        acc[jurisdiction_id][status] = count
      end

    # Preload all jurisdictions to avoid additional queries
    jurisdictions = Jurisdiction.select(:id, :name, :locality_type).index_by(&:id)

    # Transform the organized counts into the desired format
    jurisdictions.values.map do |jurisdiction|
      counts_for_jurisdiction = jurisdiction_counts[jurisdiction.id] || {}
      {
        name: jurisdiction.qualified_name,
        draft: (counts_for_jurisdiction["new_draft"] || 0) + (counts_for_jurisdiction["revisions_requested"] || 0),
        submitted: (counts_for_jurisdiction["newly_submitted"] || 0) + (counts_for_jurisdiction["resubmitted"] || 0),
      }
    end
  end

  private

  def update_collaboration_assignments
    # TODO: Implement this method to remove collaborations for missing requirement block when a new template is published
  end

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
      errors.add(
        :submitter,
        I18n.t("activerecord.errors.models.permit_application.attributes.submitter.incorrect_role"),
      )
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

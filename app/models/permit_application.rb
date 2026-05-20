class PermitApplication < ApplicationRecord
  searchkick word_middle: %i[
               nickname
               full_address
               template_tags
               submitter
               status
               review_delegatee_name
             ],
             text_end: %i[number]
  audited on: %i[create update],
          only: %i[status reference_number discarded_at],
          associated_with: :permit_project

  include FormSupportingDocuments
  include AutomatedComplianceUtils
  include StepCodeFieldExtraction
  include ZipfileUploader.Attachment(:zipfile)
  include PermitApplicationStatus
  include ProjectItem
  include Discard::Model
  include PublicRecordable
  has_parent :permit_project

  SEARCH_INCLUDES = [
    :submission_versions,
    :step_code,
    :submitter,
    { permit_collaborations: :collaborator }
  ]

  belongs_to :submitter, class_name: "User", optional: true
  public_recordable user_association: :submitter
  belongs_to :template_version
  belongs_to :permit_project, optional: true, touch: true

  has_one :requirement_template, through: :template_version

  delegate :tag_list,
           to: :requirement_template,
           prefix: :template,
           allow_nil: true

  attr_accessor :front_end_form_update

  has_many :submission_versions, dependent: :destroy
  has_many :permit_collaborations,
           -> { where(discarded_at: nil) },
           dependent: :destroy
  has_many :collaborators, through: :permit_collaborations
  has_many :permit_block_statuses, dependent: :destroy

  has_one :step_code, -> { kept }, dependent: :nullify

  scope :submitted, -> { joins(:submission_versions).distinct }

  scope :sandboxed,
        -> do
          joins(:permit_project).where.not(permit_projects: { sandbox_id: nil })
        end
  scope :live,
        -> do
          joins(:permit_project).where(permit_projects: { sandbox_id: nil })
        end
  scope :for_sandbox,
        ->(sandbox) do
          joins(:permit_project).where(
            permit_projects: {
              sandbox_id: sandbox&.id
            }
          )
        end

  validate :jurisdiction_or_permit_project_present
  validate :jurisdiction_has_matching_submission_contact
  validates :number, presence: true
  validates :reference_number, length: { maximum: 300 }, allow_nil: true
  validate :submission_versions_match_status

  delegate :published_template_version, to: :template_version

  before_validation :assign_unique_number, on: :create
  before_validation :set_template_version, on: :create
  before_validation :assign_default_nickname, on: :create
  before_validation :populate_base_form_data, on: :create
  before_save :take_form_customizations_snapshot_if_submitted

  after_commit :reindex_jurisdiction_permit_application_size
  after_commit :send_submitted_webhook, if: :saved_change_to_status?
  after_commit :reindex_permit_project, if: :saved_change_to_status?
  after_commit :broadcast_jurisdiction_count_update,
               if: :status_changed_to_intake?
  after_commit :mark_permit_project_as_unviewed, if: :status_changed_to_intake?
  after_commit :enqueue_permit_project_if_draft, if: :status_changed_to_intake?
  scope :with_submitter_role,
        -> { joins(:submitter).where(users: { role: "submitter" }) }

  scope :unviewed,
        -> do
          where(status: submitted_statuses, viewed_at: nil).order(
            submitted_at: :asc
          )
        end

  COMPLETION_SECTION_KEY = "section-completion-key"

  def public_record?
    !new_draft?
  end

  def inbox_enabled?
    jurisdiction&.inbox_enabled? && SiteConfiguration.inbox_enabled?
  end

  def inbox_enabled
    inbox_enabled?
  end

  def supporting_documents_for_submitter_based_on_user_permissions(
    supporting_documents,
    user: nil
  )
    return supporting_documents if user.blank?

    permissions =
      submission_requirement_block_edit_permissions(user_id: user.id)

    return supporting_documents if permissions == :all

    return [] if permissions.blank?

    supporting_documents.select do |s|
      return false if s.data_key.blank?

      rb_id = s.data_key[/RB([a-zA-Z0-9\-]+)/, 1]

      permissions.include?(rb_id)
    end
  end

  def formatted_submission_data(current_user: nil)
    PermitApplication::SubmissionDataService.new(
      self
    ).formatted_submission_data(current_user: current_user)
  end

  def users_by_collaboration_options(
    collaboration_type:,
    collaborator_type: nil,
    assigned_requirement_block_id: nil
  )
    base_where_clause = {
      collaborations: {
        permit_collaborations: {
          collaboration_type: collaboration_type,
          permit_application_id: id,
          discarded_at: nil
        }
      }
    }

    base_where_clause[:collaborations][:permit_collaborations][
      :collaborator_type
    ] = collaborator_type if collaborator_type.present?

    base_where_clause[:collaborations][:permit_collaborations][
      :assigned_requirement_block_id
    ] = assigned_requirement_block_id if assigned_requirement_block_id.present?

    User
      .joins(collaborations: :permit_collaborations)
      .where(base_where_clause)
      .distinct
  end

  def permit_collaborations(user = nil)
    base = association(:permit_collaborations).reader

    return base if user.nil? || submitter_id == user.id

    if base.loaded?
      base.select { |pc| pc.collaborator&.user_id == user.id }
    else
      base.joins(:collaborator).where(collaborators: { user_id: user.id })
    end
  end

  def latest_submission_version
    submission_versions.order(created_at: :desc).first
  end

  def earliest_submission_version
    submission_versions.order(created_at: :desc).last
  end

  def revision_requests
    latest_submission_version&.revision_requests || RevisionRequest.none
  end

  def form_json(current_user: nil)
    result =
      PermitApplication::FormJsonService.new(
        permit_application: self,
        current_user:
      ).call
    result.form_json
  end

  def force_update_published_template_version
    return unless Rails.env.development?

    current_published_template_version.update(
      form_json:
        current_published_template_version.requirement_template.to_form_json
    )
  end

  def update_with_submission_data_merge(
    permit_application_params:,
    current_user: nil
  )
    PermitApplication::SubmissionDataService.new(
      self
    ).update_with_submission_data_merge(
      permit_application_params:,
      current_user:
    )
  end

  def template_nickname
    template_version.requirement_template.nickname
  end

  def search_data
    {
      number: number,
      nickname: nickname,
      full_address: full_address,
      template_tags: template_tag_list&.join(", "),
      submitter: "#{submitter.name} #{submitter.email}",
      submitted_at: submitted_at,
      resubmitted_at: resubmitted_at,
      viewed_at: viewed_at,
      status: status,
      jurisdiction_id: jurisdiction&.id,
      submitter_id: submitter.id,
      template_version_id: template_version.id,
      requirement_template_id: template_version.requirement_template.id,
      created_at: created_at,
      updated_at: updated_at,
      user_ids_with_submission_edit_permissions:
        [submitter.id] +
          users_by_collaboration_options(collaboration_type: :submission).pluck(
            :id
          ),
      review_delegatee_name: review_delegatee_name,
      review_collaborator_user_ids:
        permit_collaborations
          .review
          .joins(:collaborator)
          .pluck("collaborators.user_id")
          .uniq,
      has_collaborator: has_collaborator?,
      sandbox_id: sandbox_id,
      permit_project_id: permit_project_id,
      project_number: permit_project&.number,
      submission_delegatee_id: submission_delegatee&.id,
      discarded: discarded?,
      queue_time_seconds: queue_time_seconds,
      queue_clock_started_at: queue_clock_started_at&.to_i
    }
  end

  def submission_delegatee
    collaborators.where(
      permit_collaborations: {
        collaboration_type: :submission,
        collaborator_type: :delegatee
      }
    ).first
  end

  def collaborator?(user_id:, collaboration_type:, collaborator_type: nil)
    users_by_collaboration_options(
      collaboration_type:,
      collaborator_type:
    ).exists?(id: user_id)
  end

  def has_collaborator?
    collaborators.any?
  end

  def submission_requirement_block_edit_permissions(user_id:)
    if submitter_id != user_id &&
         !collaborator?(user_id:, collaboration_type: :submission)
      return nil
    end

    if submitter_id == user_id ||
         collaborator?(
           user_id:,
           collaboration_type: :submission,
           collaborator_type: :delegatee
         )
      return :all
    end

    permit_collaborations
      .joins(:collaborator)
      .where(collaboration_type: :submission, collaborators: { user_id: })
      .map(&:assigned_requirement_block_id)
      .compact
  end

  def user_can_edit_block?(user_id:, requirement_block_id:)
    permissions =
      submission_requirement_block_edit_permissions(user_id: user_id)
    return false unless permissions
    return true if permissions == :all

    permissions.include?(requirement_block_id)
  end

  def user_can_edit_step_code_block?(user_id:)
    block_id = energy_step_code_requirement_block_id
    return false unless block_id

    user_can_edit_block?(user_id: user_id, requirement_block_id: block_id)
  end

  def using_current_template_version
    TemplateVersion.cached_published_ids.include?(template_version_id)
  end

  def current_published_template_version
    requirement_template&.published_template_version
  end

  def form_customizations
    if submitted?
      form_customizations_snapshot
    else
      jurisdiction
        &.jurisdiction_template_version_customizations
        &.find_by(template_version: template_version, sandbox_id: sandbox_id)
        &.customizations
    end
  end

  def update_viewed_at
    return unless latest_submission_version.present?

    latest_submission_version.update(viewed_at: Time.current)
    reindex
  end

  def mark_as_unviewed
    return unless latest_submission_version.present?

    latest_submission_version.update(viewed_at: nil)
    reindex
  end

  def number_prefix
    jurisdiction&.prefix
  end

  def notifiable_users
    relevant_collaborators = [submitter]
    designated_submitter =
      users_by_collaboration_options(
        collaboration_type: :submission,
        collaborator_type: :delegatee
      ).first

    if designated_submitter.present?
      relevant_collaborators << designated_submitter
    end

    if submitted?
      relevant_collaborators =
        relevant_collaborators +
          (
            jurisdiction&.review_managers || []
          ) if jurisdiction&.review_managers.present?
      relevant_collaborators =
        relevant_collaborators +
          (
            jurisdiction&.regional_review_managers || []
          ) if jurisdiction&.regional_review_managers.present?
      relevant_collaborators =
        relevant_collaborators +
          (jurisdiction&.reviewers || []) if jurisdiction&.reviewers.present?
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

  def days_in_queue
    seconds = queue_time_seconds || 0
    seconds +=
      (Time.current - queue_clock_started_at).to_i if queue_clock_started_at
    (seconds / 86400.0).floor
  end

  def days_ago_submitted
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

  def confirmed_submission_contacts
    customization =
      jurisdiction&.jurisdiction_template_version_customizations&.find_by(
        template_version: template_version,
        sandbox_id: sandbox_id
      )

    if customization&.submission_contact&.confirmed?
      [customization.submission_contact]
    else
      jurisdiction.submission_contacts.confirmed.default_contact
    end
  end

  def send_submit_notifications
    NotificationService.publish_application_submission_event(self)
  end

  def formatted_submission_data_for_external_use
    ExternalPermitApplicationService.new(
      self
    ).formatted_submission_data_for_external_use
  end

  def formatted_raw_h2k_files_for_external_use
    ExternalPermitApplicationService.new(self).get_raw_h2k_files
  end

  def send_submitted_webhook
    return unless submitted?

    jurisdiction
      .active_external_api_keys
      .where.not(webhook_url: [nil, ""])
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
          id
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
      "action_type" =>
        Constants::NotificationActionTypes::APPLICATION_SUBMISSION,
      "action_text" =>
        "#{I18n.t(i18n_key, number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id
      }
    }
  end

  def revisions_request_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::APPLICATION_REVISIONS_REQUEST,
      "action_text" =>
        "#{I18n.t("notification.permit_application.revisions_request_notification", number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id,
        "permit_application_number" => number
      }
    }
  end

  def review_started_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::REVIEW_STARTED,
      "action_text" =>
        "#{I18n.t("notification.permit_application.review_started_notification", number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id,
        "permit_application_number" => number
      }
    }
  end

  def application_reference_updated_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::APPLICATION_REFERENCE_UPDATED,
      "action_text" =>
        "#{I18n.t("notification.permit_application.reference_updated_notification", number: number, jurisdiction_name: jurisdiction_name)}",
      "object_data" => {
        "permit_application_id" => id
      }
    }
  end

  def step_code_requirements
    jurisdiction&.jurisdiction_step_requirements
  end

  def energy_step_code_requirement_block_id
    blocks = template_version&.requirement_blocks_json
    return nil unless blocks

    blocks.each do |block_id, block_json|
      if block_json["requirements"]&.any? { |req|
           req["input_type"] == "energy_step_code" ||
             req["input_type"] == "energy_step_code_part_3"
         }
        return block_id
      end
    end

    nil
  end

  def energy_step_code_required?
    custom_requirements = step_code_requirements&.customizations

    return true if custom_requirements.blank?

    custom_requirements.empty? ||
      custom_requirements.any? do |r|
        r.energy_step_required || r.zero_carbon_step_required
      end
  end

  def self.stats_by_template_jurisdiction_and_status
    sv_min =
      SubmissionVersion.select(
        "permit_application_id, MIN(created_at) AS min_submission_created_at"
      ).group(:permit_application_id)

    sv_max =
      SubmissionVersion.select(
        "permit_application_id, MAX(created_at) AS max_submission_created_at"
      ).group(:permit_application_id)

    aggregates =
      PermitApplication
        .joins(template_version: :requirement_template)
        .joins(:submitter)
        .joins(
          "LEFT OUTER JOIN permit_projects ON permit_projects.id = permit_applications.permit_project_id"
        )
        .joins(
          "INNER JOIN jurisdictions ON jurisdictions.id = COALESCE(permit_projects.jurisdiction_id, permit_applications.jurisdiction_id)"
        )
        .joins(
          "LEFT JOIN (#{sv_min.to_sql}) sv_min ON sv_min.permit_application_id = permit_applications.id"
        )
        .joins(
          "LEFT JOIN (#{sv_max.to_sql}) sv_max ON sv_max.permit_application_id = permit_applications.id"
        )
        .where(users: { role: "submitter" })
        .group(
          "jurisdictions.id",
          "requirement_templates.id",
          "jurisdictions.name",
          "requirement_templates.id"
        )
        .select(
          "jurisdictions.id AS jurisdiction_id",
          "requirement_templates.id AS requirement_template_id",
          "jurisdictions.name AS jurisdiction_name",
          "requirement_templates.id AS requirement_template_id",
          "COUNT(CASE WHEN permit_applications.status = 0 THEN 1 END) AS draft_count",
          "COUNT(CASE WHEN permit_applications.status != 0 THEN 1 END) AS submitted_count",
          "AVG(
                CASE
                  WHEN sv_min.min_submission_created_at IS NOT NULL THEN EXTRACT(EPOCH FROM (sv_min.min_submission_created_at - permit_applications.created_at))
                  ELSE EXTRACT(EPOCH FROM (NOW() - permit_applications.created_at))
                END
              ) AS average_time_spent_before_first_submit",
          "AVG(
                CASE
                  WHEN sv_max.max_submission_created_at IS NOT NULL THEN EXTRACT(EPOCH FROM (sv_max.max_submission_created_at - permit_applications.created_at))
                  ELSE EXTRACT(EPOCH FROM (NOW() - permit_applications.created_at))
                END
              ) AS average_time_spent_before_latest_submit"
        )

    requirement_templates = RequirementTemplate.all.index_by(&:id)

    aggregates.map do |aggregate|
      requirement_template =
        requirement_templates[aggregate.requirement_template_id]
      {
        jurisdiction_name:
          aggregate.jurisdiction_name || "Unknown Jurisdiction",
        template_nickname: requirement_template&.nickname,
        tags: requirement_template&.tag_list || [],
        draft_applications: aggregate.draft_count.to_i,
        submitted_applications: aggregate.submitted_count.to_i,
        average_time_spent_before_first_submit:
          (aggregate.average_time_spent_before_first_submit || 0).to_i,
        average_time_spent_before_latest_submit:
          (aggregate.average_time_spent_before_latest_submit || 0).to_i
      }
    end
  end

  def review_delegatee_name
    users_by_collaboration_options(
      collaboration_type: :review,
      collaborator_type: :delegatee
    ).first&.name
  end

  def jurisdiction_name
    jurisdiction&.qualified_name
  end

  def search_document_id
    self.id
  end

  def short_address
    full_address.split(",").first
  end

  def broadcast_jurisdiction_count_update
    return unless jurisdiction.present?

    review_staff_user_ids =
      jurisdiction.users.kept.select(&:review_staff?).map(&:id)
    return if review_staff_user_ids.empty?

    WebsocketBroadcaster.push_update_to_relevant_users(
      review_staff_user_ids,
      Constants::Websockets::Events::Jurisdiction::DOMAIN,
      Constants::Websockets::Events::Jurisdiction::TYPES[
        :unviewed_submissions_count_updated
      ],
      {
        jurisdiction_id: jurisdiction.id,
        sandbox_id: sandbox_id,
        unviewed_count:
          jurisdiction.unviewed_submissions_count(sandbox: sandbox)
      }
    )
  end

  private

  def update_collaboration_assignments
    # TODO: Implement this method to remove collaborations for missing requirement block when a new template is published
  end

  def assign_default_nickname
    self.nickname = requirement_template.nickname if nickname.blank?
  end

  def assign_unique_number
    new_number =
      jurisdiction.with_lock do
        last_number =
          jurisdiction
            .permit_applications
            .where("permit_applications.number LIKE ?", "#{number_prefix}-%")
            .order(
              Arel.sql("LENGTH(permit_applications.number) DESC"),
              Arel.sql("permit_applications.number DESC")
            )
            .limit(1)
            .pluck(:number)
            .first

        loop do
          if last_number
            number_parts = last_number.split("-")
            new_integer = number_parts[1..-1].join.to_i + 1

            new_number =
              format(
                "%s-%03d-%03d-%03d",
                number_prefix,
                new_integer / 1_000_000 % 1000,
                new_integer / 1000 % 1000,
                new_integer % 1000
              )
          else
            new_number = format("%s-001-000-000", number_prefix)
          end

          unless PermitApplication.where.not(id: id).exists?(number: new_number)
            break
          end

          last_number = new_number
        end

        new_number
      end

    self.number = new_number if self.number.blank?
    return new_number
  end

  def take_form_customizations_snapshot_if_submitted
    return unless status_changed? && submitted?

    current_customizations =
      jurisdiction
        &.jurisdiction_template_version_customizations
        &.find_by(template_version: template_version)
        &.customizations

    return unless current_customizations.present?

    self.form_customizations_snapshot = current_customizations
  end

  def status_changed_to_intake?
    saved_change_to_status? && intake?
  end

  def reindex_jurisdiction_permit_application_size
    return unless permit_project&.jurisdiction.present?
    unless new_record? || destroyed? || saved_change_to_permit_project_id?
      return
    end

    permit_project.jurisdiction.reindex
  end

  def reindex_permit_project
    permit_project&.reindex
  end

  def mark_permit_project_as_unviewed
    permit_project&.mark_as_unviewed
  end

  # TODO: Also enqueue project when a meeting request is made
  def enqueue_permit_project_if_draft
    permit_project&.enqueue! if permit_project&.draft?
  end

  def jurisdiction_or_permit_project_present
    if jurisdiction.nil? && permit_project.nil?
      errors.add(
        :jurisdiction,
        I18n.t(
          "activerecord.errors.models.permit_application.attributes.jurisdiction.no_jurisdiction"
        )
      )
    end
  end

  def submitter_must_have_role
    unless submitter&.submitter?
      errors.add(
        :submitter,
        I18n.t(
          "activerecord.errors.models.permit_application.attributes.submitter.incorrect_role"
        )
      )
    end
  end

  def jurisdiction_has_matching_submission_contact
    return if sandbox.present?
    return unless jurisdiction

    matching_confirmed_contacts = jurisdiction.submission_contacts.confirmed

    if matching_confirmed_contacts.empty?
      errors.add(
        :jurisdiction_id,
        I18n.t(
          "activerecord.errors.models.permit_application.attributes.jurisdiction.no_contact"
        )
      )
    end
  end

  def submission_versions_match_status
    return if new_record?

    sv_count = submission_versions.size

    if new_draft? && sv_count > 0
      errors.add(:base, "Draft applications must not have submission versions")
    elsif (
          newly_submitted? || in_review? || approved? || issued? || withdrawn?
        ) && sv_count < 1
      errors.add(
        :base,
        "Non-draft applications must have at least one submission version"
      )
    elsif revisions_requested?
      if sv_count < 1
        errors.add(
          :base,
          "Revisions-requested applications must have at least one submission version"
        )
      elsif latest_submission_version.revision_requests.empty?
        errors.add(
          :base,
          "Revisions-requested applications must have at least one revision request"
        )
      end
    elsif resubmitted? && sv_count < 2
      errors.add(
        :base,
        "Resubmitted applications must have at least two submission versions"
      )
    end
  end
end

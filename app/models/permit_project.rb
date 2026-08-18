class PermitProject < ApplicationRecord
  # searchkick must be declared before Discard::Model to ensure auto-callbacks register correctly
  searchkick word_middle: %i[title full_address pid pin number owner_name]
  audited on: %i[create update], only: %i[title full_address state viewed_at]
  has_associated_audits

  include Discard::Model
  include PublicRecordable
  include PermitProjectState

  belongs_to :owner, class_name: "User", optional: true
  public_recordable user_association: :owner
  belongs_to :jurisdiction, optional: false # Direct association to Jurisdiction
  belongs_to :sandbox, optional: true
  has_many :permit_project_collaborations,
           -> { where(discarded_at: nil) },
           dependent: :destroy
  has_many :project_review_collaborators,
           through: :permit_project_collaborations,
           source: :collaborator

  has_many :project_memberships, dependent: :destroy
  has_many :members, through: :project_memberships, source: :user
  has_many :project_teams, dependent: :destroy

  has_many :permit_applications
  has_many :project_documents, dependent: :destroy
  has_many :project_meetings, dependent: :destroy
  has_many :step_codes
  has_many :collaborators, through: :permit_applications
  has_many :pinned_projects, dependent: :destroy
  has_many :pinning_users, through: :pinned_projects, source: :user
  accepts_nested_attributes_for :project_documents, allow_destroy: true

  validates :title, presence: true
  validates :number, presence: true, on: :update
  validate :sandbox_belongs_to_jurisdiction
  validate :owner_cannot_be_jurisdiction_staff_without_sandbox
  before_validation :set_default_title

  before_validation :assign_unique_number, if: -> { number.blank? }
  before_save :normalize_pid
  before_save :fetch_coordinates, if: -> { pid_changed? }

  delegate :name, to: :owner, prefix: true

  after_create :create_auto_teams

  after_commit :reindex
  after_commit :broadcast_jurisdiction_projects_count_update,
               if: :should_broadcast_projects_count_update?

  scope :sandboxed, -> { where.not(sandbox_id: nil) }
  scope :live, -> { where(sandbox_id: nil) }
  scope :for_sandbox, ->(sandbox) { where(sandbox_id: sandbox&.id) }

  scope :with_status_counts,
        -> do
          select(
            "permit_projects.*, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.discarded_at IS NULL) AS total_permits_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 0 AND pa.discarded_at IS NULL) AS new_draft_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 1 AND pa.discarded_at IS NULL) AS newly_submitted_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 2 AND pa.discarded_at IS NULL) AS in_review_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 3 AND pa.discarded_at IS NULL) AS revisions_requested_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 4 AND pa.discarded_at IS NULL) AS resubmitted_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 5 AND pa.discarded_at IS NULL) AS approved_count"
          )
        end

  def public_record?
    permit_applications.any?(&:public_record?)
  end

  # Effective project-wide permissions: the per-domain max across every team the
  # user's membership puts them in. The owner is locked at full permissions.
  def permissions_for(user)
    permissions_for_user_id(user&.id)
  end

  def permissions_for_user_id(user_id)
    @permissions_for ||= {}
    @permissions_for[user_id] ||= compute_permissions_for(user_id)
  end

  def membership_for(user)
    membership_for_user_id(user&.id)
  end

  def membership_for_user_id(user_id)
    return nil if user_id.blank?

    project_memberships.kept.find_by(user_id: user_id)
  end

  # "owner" is not a ProjectMembership role, so the tabs need it derived.
  def project_role_for(user)
    return nil if user.blank?
    return "owner" if owner_id == user.id

    membership_for(user)&.role
  end

  def auto_teams
    ProjectTeam::AUTO_TEAM_DEFAULTS.keys.filter_map do |kind|
      project_teams.detect { |team| team.kind == kind.to_s }
    end
  end

  # Users who can find this project in search: owner, every kept member, and
  # legacy submission collaborators. Application visibility is still gated by
  # project_read? (Full read), not by presence in this list.
  def readable_user_ids
    ids = [owner_id]
    ids += project_memberships.kept.pluck(:user_id)
    ids += legacy_submission_collaborations.pluck("collaborators.user_id")
    ids.compact.uniq
  end

  def total_permits_count
    self[:total_permits_count] || permit_applications.kept.count
  end

  def new_draft_count
    self[:new_draft_count] ||
      permit_applications.kept.where(status: :new_draft).count
  end

  def newly_submitted_count
    self[:newly_submitted_count] ||
      permit_applications.kept.where(status: :newly_submitted).count
  end

  def in_review_count
    self[:in_review_count] ||
      permit_applications.kept.where(status: :in_review).count
  end

  def revisions_requested_count
    self[:revisions_requested_count] ||
      permit_applications.kept.where(status: :revisions_requested).count
  end

  def resubmitted_count
    self[:resubmitted_count] ||
      permit_applications.kept.where(status: :resubmitted).count
  end

  def reference_number
    # To be overridden by PermitApplication using ProjectItem
    nil
  end

  def permit_type
    # To be overridden by PermitApplication using ProjectItem
    nil
  end

  def phase
    # To be implemented later
    nil
  end

  def approved_count
    self[:approved_count] ||
      permit_applications.kept.where(status: :approved).count
  end

  def active_project_meeting
    project_meetings.active.order(created_at: :desc).first
  end

  def has_active_project_meeting
    project_meetings.active.exists?
  end

  def days_in_queue
    seconds = queue_time_seconds || 0
    seconds +=
      (Time.current - queue_clock_started_at).to_i if queue_clock_started_at
    (seconds / 86400.0).floor
  end

  # Earliest submission time across all kept permit applications on this project.
  # Returns nil if no applications have been submitted yet.
  def first_application_received_at
    permit_applications.kept.map(&:submitted_at).compact.min
  end

  def update_viewed_at
    return if viewed_at.present?

    update!(viewed_at: Time.current)
  end

  def mark_as_unviewed
    return if viewed_at.blank?

    update!(viewed_at: nil)
  end

  def broadcast_jurisdiction_projects_count_update
    return unless jurisdiction.present?

    review_staff_user_ids =
      jurisdiction.users.kept.select(&:review_staff?).map(&:id)
    return if review_staff_user_ids.empty?

    WebsocketBroadcaster.push_update_to_relevant_users(
      review_staff_user_ids,
      Constants::Websockets::Events::Jurisdiction::DOMAIN,
      Constants::Websockets::Events::Jurisdiction::TYPES[
        :unviewed_projects_count_updated
      ],
      {
        jurisdiction_id: jurisdiction.id,
        sandbox_id: sandbox_id,
        unviewed_count: jurisdiction.unviewed_projects_count(sandbox: sandbox)
      }
    )
  end

  def search_data
    {
      title: title,
      full_address: full_address,
      pid: pid,
      pin: pin,
      number: number,
      owner_id: owner_id,
      owner_name: owner&.name,
      jurisdiction_id: jurisdiction_id,
      sandbox_id: sandbox_id,
      collaborator_ids: collaborators.pluck(:user_id).uniq,
      readable_user_ids: readable_user_ids,
      review_collaborator_user_ids: compute_review_collaborator_user_ids,
      created_at: created_at,
      updated_at: updated_at,
      discarded: discarded_at.present?,
      state: state,
      rollup_status: rollup_status,
      inbox_rollup_status: inbox_rollup_status,
      viewed_at: viewed_at,
      enqueued_at: enqueued_at,
      has_active_project_meeting: has_active_project_meeting,
      forcasted_completion_date: forcasted_completion_date,
      requirement_template_ids:
        permit_applications
          .kept
          .includes(:requirement_template)
          .filter_map { |pa| pa.requirement_template&.id }
          .uniq,
      total_permits_count: permit_applications.kept.count,
      new_draft_count: permit_applications.kept.where(status: :new_draft).count,
      newly_submitted_count:
        permit_applications.kept.where(status: :newly_submitted).count,
      in_review_count: permit_applications.kept.where(status: :in_review).count,
      revisions_requested_count:
        permit_applications.kept.where(status: :revisions_requested).count,
      resubmitted_count:
        permit_applications.kept.where(status: :resubmitted).count,
      approved_count: permit_applications.kept.where(status: :approved).count,
      queue_time_seconds: queue_time_seconds,
      queue_clock_started_at: queue_clock_started_at&.to_i
    }
  end

  # This method might no longer make sense if there can be multiple applications or item types.
  # Or it should return the primary_project_item if it's a PermitApplication.
  # def permit_application
  #   item = primary_project_item
  #   item if item.is_a?(PermitApplication)
  # end

  # TODO: Re-evaluate and re-implement search_data based on primary_project_item
  # and the possibility of multiple items of different types in the future.

  def forcasted_completion_date
    # Example implementation, to be defined by user
    Time.zone.now + 14.days
  end

  def shortened_address
    full_address.split(",").first
  end

  # Reviewer inbox preview: newest visible-to-reviewer applications (not owner-scoped).
  def recent_inbox_permit_applications(limit: 3)
    permit_applications
      .kept
      .includes(:submitter, :template_version, requirement_template: :taggings)
      .select(&:submitted_at_least_once?)
      .sort_by(&:updated_at)
      .last(limit)
  end

  def recent_permit_applications(user = nil)
    return PermitApplication.none if user.nil?

    scope =
      permit_applications
        .kept
        .includes(
          :submission_versions,
          :permit_collaborations,
          :submitter,
          :template_version,
          requirement_template: :taggings
        )
        .order(updated_at: :desc)
    return scope.limit(3) if owner_id == user.id

    scope
      .joins(permit_collaborations: :collaborator)
      .where(
        collaborators: {
          user_id: user.id
        },
        permit_collaborations: {
          discarded_at: nil
        }
      )
      .distinct
      .limit(3)
  end

  def submission_collaborators(user = nil)
    return Collaborator.none if user.nil?

    if owner_id == user.id
      return(
        Collaborator
          .joins(:permit_collaborations)
          .where(
            permit_collaborations: {
              permit_application_id: permit_applications.kept.select(:id),
              collaboration_type: :submission,
              discarded_at: nil
            }
          )
          .distinct
      )
    end

    Collaborator.none
  end

  def project_documents(user = nil)
    # Limit project documents to owner for now
    base = association(:project_documents).reader
    return ProjectDocument.none if user.nil?

    return base if owner_id == user.id

    # Not the owner: return an empty result, preferring in-memory if already loaded
    base.loaded? ? [] : ProjectDocument.none
  end

  def recent_audits(user = nil)
    return [] if user.nil?

    scope =
      ApplicationAudit
        .for_permit_project(id)
        .includes(:user, :auditable)
        .order(created_at: :desc)

    scope = ApplicationAudit.visible_to_role(scope, user)
    audits = scope.limit(3).to_a
    ApplicationAudit.preload_activity_feed(audits)
    audits
  end

  # Exposed in API as +review_delegatee+ (Collaborator JSON). UI treats a single project reviewer.
  def review_delegatee
    permit_project_collaborations
      .includes(collaborator: :user)
      .first
      &.collaborator
  end

  def project_meetings_enabled?
    SiteConfiguration.project_meetings_enabled? &&
      jurisdiction&.project_meetings_enabled
  end

  # Atomically assigns the project's single review collaborator, replacing any
  # existing assignment. Re-picking the current collaborator is a no-op (no
  # notification churn). Locks existing kept rows to serialize concurrent calls.
  def assign_project_review_collaborator!(collaborator_id)
    transaction do
      existing = permit_project_collaborations.kept.lock.first

      if existing&.collaborator_id == collaborator_id
        existing
      else
        existing&.discard!

        collaboration =
          permit_project_collaborations.create!(
            collaborator_id: collaborator_id
          )

        PermitHubMailer.notify_project_review_collaboration(
          permit_project_collaboration: collaboration
        )&.deliver_later

        NotificationService.publish_project_collaboration_assignment_event(
          collaboration
        )

        collaboration
      end
    end
  end

  def unassign_project_review_collaborator!(collaborator_id)
    collaboration =
      permit_project_collaborations.find_by!(collaborator_id: collaborator_id)
    collaboration.discard!
  end

  private

  def compute_permissions_for(user_id)
    return ProjectPermissions.none if user_id.blank?
    return ProjectPermissions.owner if owner_id == user_id

    membership = membership_for_user_id(user_id)
    permissions =
      if membership
        ProjectPermissions.from_teams(membership.teams)
      else
        ProjectPermissions.none
      end

    permissions.at_least(project_access: legacy_collaboration_access(user_id))
  end

  # ponytail: temporary bridge so submission collaborators created under the old
  # model keep read access after the swap onto team permissions. Their per-block
  # edit rights still come from PermitCollaboration itself. Remove together with
  # the phase 2 migration of collaborations onto project teams.
  def legacy_collaboration_access(user_id)
    if legacy_submission_collaborations.exists?(
         collaborators: {
           user_id: user_id
         }
       )
      :read
    else
      :none
    end
  end

  def legacy_submission_collaborations
    PermitCollaboration
      .kept
      .submission
      .joins(:collaborator)
      .where(permit_application_id: permit_applications.kept.select(:id))
  end

  def create_auto_teams
    ProjectTeam::AUTO_TEAM_DEFAULTS.each do |kind, attributes|
      project_teams.create!(attributes.merge(kind: kind))
    end
  end

  # Recompute the jurisdiction-wide unviewed projects badge whenever a change
  # could affect membership in the set counted by
  # Jurisdiction#unviewed_projects_count:
  #   - viewed_at transitions (mark_as_unviewed / update_viewed_at)
  #   - state transitions in/out of "draft"
  #   - discarded/undiscarded transitions
  def should_broadcast_projects_count_update?
    saved_change_to_viewed_at? || saved_change_to_state? ||
      saved_change_to_discarded_at?
  end

  def sandbox_belongs_to_jurisdiction
    return unless sandbox
    return unless jurisdiction
    return if jurisdiction.sandboxes.include?(sandbox)

    errors.add(
      :sandbox,
      I18n.t(
        "activerecord.errors.models.permit_project.attributes.sandbox.incorrect_jurisdiction"
      )
    )
  end

  def owner_cannot_be_jurisdiction_staff_without_sandbox
    return unless owner&.jurisdiction_staff?
    return if sandbox_id.present?

    errors.add(
      :owner,
      I18n.t(
        "activerecord.errors.models.permit_project.attributes.owner.review_staff_requires_sandbox"
      )
    )
  end

  def compute_review_collaborator_user_ids
    pa_user_ids =
      PermitCollaboration
        .joins(:collaborator)
        .where(permit_application_id: permit_applications.kept.select(:id))
        .where(collaboration_type: :review, discarded_at: nil)
        .pluck("collaborators.user_id")

    project_user_ids =
      permit_project_collaborations.joins(:collaborator).pluck(
        "collaborators.user_id"
      )

    (pa_user_ids + project_user_ids).uniq
  end

  def normalize_pid
    self.pid = pid.delete("-") if pid.present?
  end

  def fetch_coordinates
    return if pid.blank?

    result = Wrappers::LtsaParcelMapBc.new.get_coordinates_by_pid(pid)
    if result
      self.longitude = result[:centroid].first
      self.latitude = result[:centroid].last
      self.parcel_geometry = { rings: result[:rings] }
    else
      self.latitude = nil
      self.longitude = nil
      self.parcel_geometry = nil
    end
  rescue => e
    Rails.logger.warn(
      "Failed to fetch coordinates for PID #{pid}: #{e.message}"
    )
    self.latitude = nil
    self.longitude = nil
    self.parcel_geometry = nil
  end

  def set_default_title
    self.title = shortened_address if title.blank? && full_address.present?
  end

  def assign_unique_number
    return if number.present?
    return if jurisdiction.blank?

    prefix = jurisdiction.prefix
    return if prefix.blank?
    last_number =
      PermitProject
        .where("number LIKE ?", "#{prefix}-%")
        .order(Arel.sql("LENGTH(number) DESC, number DESC"))
        .limit(1)
        .pluck(:number)
        .first

    new_integer =
      if last_number
        number_parts = last_number.split("-")
        # Handles both PROJ-DDDDD and PROJ-DDDD-DDDD formats
        number_parts[1..].join.to_i + 1
      else
        1
      end

    new_number =
      format(
        "%s-%04d-%04d",
        prefix,
        new_integer / 10_000 % 10_000,
        new_integer % 10_000
      )

    # In the unlikely event of a race condition, this ensures the number is unique
    while PermitProject.exists?(number: new_number)
      number_parts = new_number.split("-")
      new_integer = number_parts[1..].join.to_i + 1
      new_number =
        format(
          "%s-%04d-%04d",
          prefix,
          new_integer / 10_000 % 10_000,
          new_integer % 10_000
        )
    end

    self.number = new_number
  end
end

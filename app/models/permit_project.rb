class PermitProject < ApplicationRecord
  # searchkick must be declared before Discard::Model to ensure auto-callbacks register correctly
  searchkick word_middle: %i[title full_address pid pin number owner_name]
  audited on: %i[create update], only: %i[title full_address]
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

  has_many :permit_applications
  has_many :project_documents, dependent: :destroy
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

  after_commit :reindex

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

  def permit_type_id
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

  def days_in_queue
    seconds = queue_time_seconds || 0
    seconds +=
      (Time.current - queue_clock_started_at).to_i if queue_clock_started_at
    (seconds / 86400.0).floor
  end

  def update_viewed_at
    update(viewed_at: Time.current)
  end

  def mark_as_unviewed
    update(viewed_at: nil)
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
      review_collaborator_user_ids: compute_review_collaborator_user_ids,
      created_at: created_at,
      updated_at: updated_at,
      discarded: discarded_at.present?,
      state: state,
      rollup_status: rollup_status,
      inbox_rollup_status: inbox_rollup_status,
      viewed_at: viewed_at,
      enqueued_at: enqueued_at,
      forcasted_completion_date: forcasted_completion_date,
      requirement_template_ids:
        permit_applications
          .kept
          .map { |pa| pa.requirement_template&.id }
          .compact
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
      .select(&:visible_to_reviewers?)
      .sort_by(&:updated_at)
      .last(limit)
  end

  def recent_permit_applications(user = nil)
    return PermitApplication.none if user.nil?

    scope =
      permit_applications
        .kept
        .includes(:activity, :submission_versions, :permit_collaborations)
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

  def aggregated_review_collaborators
    users = {}

    # Include project-level review collaborators
    permit_project_collaborations
      .includes(collaborator: :user)
      .each do |ppc|
        user = ppc.collaborator&.user
        next unless user

        users[user.id] ||= {
          id: user.id,
          name: user.name,
          role: user.role,
          is_project_collaborator: true
        }
      end

    # Include per-application review collaborators
    permit_applications.each do |pa|
      next if pa.discarded? || !pa.submitted?

      pa.permit_collaborations.each do |collab|
        next unless collab.review?

        user = collab.collaborator&.user
        next unless user

        existing = users[user.id]
        if existing
          existing[:is_project_collaborator] ||= false
        else
          users[user.id] = {
            id: user.id,
            name: user.name,
            role: user.role,
            is_project_collaborator: false
          }
        end
      end
    end

    users.values
  end

  def designated_reviewer_enabled?
    SiteConfiguration.allow_designated_reviewer? &&
      jurisdiction&.allow_designated_reviewer
  end

  def assign_project_review_collaborator!(collaborator_id)
    unless designated_reviewer_enabled?
      raise "Designated reviewer feature is not enabled"
    end

    collaboration =
      permit_project_collaborations.create!(collaborator_id: collaborator_id)

    PermitHubMailer.notify_project_review_collaboration(
      permit_project_collaboration: collaboration
    )&.deliver_later

    NotificationService.publish_project_collaboration_assignment_event(
      collaboration
    )

    collaboration
  end

  def unassign_project_review_collaborator!(collaborator_id)
    collaboration =
      permit_project_collaborations.find_by!(collaborator_id: collaborator_id)
    collaboration.discard!
  end

  private

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

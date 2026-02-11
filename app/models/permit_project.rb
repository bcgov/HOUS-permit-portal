class PermitProject < ApplicationRecord
  # searchkick must be declared before Discard::Model to ensure auto-callbacks register correctly
  searchkick word_middle: %i[title full_address pid pin number]

  include Discard::Model
  include PublicRecordable

  belongs_to :owner, class_name: "User", optional: true
  public_recordable user_association: :owner
  belongs_to :jurisdiction, optional: false # Direct association to Jurisdiction

  has_many :permit_applications
  has_many :project_documents, dependent: :destroy
  has_many :step_codes
  has_many :collaborators, through: :permit_applications
  has_many :pinned_projects, dependent: :destroy
  has_many :pinning_users, through: :pinned_projects, source: :user
  accepts_nested_attributes_for :project_documents, allow_destroy: true

  validates :title, presence: true
  validates :number, presence: true, on: :update
  before_validation :set_default_title

  before_validation :assign_unique_number, if: -> { number.blank? }
  before_save :fetch_coordinates, if: -> { pid_changed? }

  delegate :name, to: :owner, prefix: true

  after_commit :reindex

  scope :with_status_counts,
        -> do
          select(
            "permit_projects.*, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.discarded_at IS NULL) AS total_permits_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 0 AND pa.discarded_at IS NULL) AS new_draft_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 1 AND pa.discarded_at IS NULL) AS newly_submitted_count, " +
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
      (
        begin
          permit_applications.kept.where(status: :approved).count
        rescue StandardError
          0
        end
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
      jurisdiction_id: jurisdiction_id,
      collaborator_ids: collaborators.pluck(:user_id).uniq,
      created_at: created_at,
      updated_at: updated_at,
      discarded: discarded_at.present?,
      rollup_status: rollup_status,
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
      revisions_requested_count:
        permit_applications.kept.where(status: :revisions_requested).count,
      resubmitted_count:
        permit_applications.kept.where(status: :resubmitted).count,
      approved_count: permit_applications.kept.where(status: :approved).count
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

  def rollup_status
    return "empty" if permit_applications.kept.blank?

    permit_applications.kept.max_by(&:pertinence_score).status
  end

  def forcasted_completion_date
    # Example implementation, to be defined by user
    Time.zone.now + 14.days
  end

  def shortened_address
    full_address.split(",").first
  end

  def recent_permit_applications(user = nil)
    return PermitApplication.none if user.nil?

    scope = permit_applications.kept.order(updated_at: :desc)
    return scope.limit(3) if owner_id == user.id

    scope
      .joins(permit_collaborations: :collaborator)
      .where(collaborators: { user_id: user.id })
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
              collaboration_type: :submission
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

  private

  def fetch_coordinates
    return if pid.blank?

    coords = Wrappers::LtsaParcelMapBc.new.get_coordinates_by_pid(pid)
    if coords
      self.longitude = coords.first
      self.latitude = coords.last
    else
      self.latitude = nil
      self.longitude = nil
    end
  rescue => e
    Rails.logger.warn(
      "Failed to fetch coordinates for PID #{pid}: #{e.message}"
    )
    self.latitude = nil
    self.longitude = nil
  end

  def set_default_title
    self.title = shortened_address if title.blank? && full_address.present?
  end

  def assign_unique_number
    return if number.present?

    prefix = jurisdiction.prefix
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

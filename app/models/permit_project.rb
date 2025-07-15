class PermitProject < ApplicationRecord
  include Discard::Model
  searchkick word_middle: %i[title full_address pid pin] # Search configuration for PermitProject

  belongs_to :owner, class_name: "User"
  belongs_to :jurisdiction # Direct association to Jurisdiction
  belongs_to :property_plan_jurisdiction, optional: true
  # has_one :permit_project_payment_detail, dependent: :destroy
  # has_one :payment_detail, through: :permit_project_payment_detail

  has_many :permit_applications
  has_many :project_documents, dependent: :destroy
  has_many :step_codes
  has_many :collaborators, through: :permit_applications
  has_many :pinned_projects, dependent: :destroy
  has_many :pinning_users, through: :pinned_projects, source: :user

  accepts_nested_attributes_for :project_documents, allow_destroy: true

  after_commit :reindex

  scope :with_status_counts,
        -> do
          select(
            "permit_projects.*, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id) AS total_permits_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 0) AS new_draft_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 1) AS newly_submitted_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 3) AS revisions_requested_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 4) AS resubmitted_count, " +
              "(SELECT COUNT(*) FROM permit_applications pa WHERE pa.permit_project_id = permit_projects.id AND pa.status = 5) AS approved_count"
          )
        end

  def total_permits_count
    self[:total_permits_count] || permit_applications.count
  end

  def new_draft_count
    self[:new_draft_count] ||
      permit_applications.where(status: :new_draft).count
  end

  def newly_submitted_count
    self[:newly_submitted_count] ||
      permit_applications.where(status: :newly_submitted).count
  end

  def revisions_requested_count
    self[:revisions_requested_count] ||
      permit_applications.where(status: :revisions_requested).count
  end

  def resubmitted_count
    self[:resubmitted_count] ||
      permit_applications.where(status: :resubmitted).count
  end

  def approved_count
    self[:approved_count] ||
      (
        begin
          permit_applications.where(status: :approved).count
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
      owner_id: owner_id,
      jurisdiction_id: jurisdiction_id,
      collaborator_ids: collaborators.pluck(:user_id).uniq,
      created_at: created_at,
      updated_at: updated_at,
      discarded: discarded_at.present?,
      phase: phase,
      forcasted_completion_date: forcasted_completion_date,
      requirement_template_ids:
        permit_applications
          .map { |pa| pa.requirement_template&.id }
          .compact
          .uniq,
      total_permits_count: permit_applications.count,
      new_draft_count: permit_applications.where(status: :new_draft).count,
      newly_submitted_count:
        permit_applications.where(status: :newly_submitted).count,
      revisions_requested_count:
        permit_applications.where(status: :revisions_requested).count,
      resubmitted_count: permit_applications.where(status: :resubmitted).count,
      approved_count: permit_applications.where(status: :approved).count
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

  def phase
    return "empty" if permit_applications.blank?

    permit_applications.max_by(&:pertinence_score).status
  end

  def forcasted_completion_date
    # Example implementation, to be defined by user
    Time.zone.now + 14.days
  end
end

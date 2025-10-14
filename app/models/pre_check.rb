class PreCheck < ApplicationRecord
  include ProjectItem
  has_parent :permit_application

  searchkick word_middle: %i[full_address cert_number]

  attribute :service_partner, :integer
  enum service_partner: { archistar: 0 }

  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :permit_application, optional: true
  has_one :permit_project, through: :permit_application

  validate :permit_application_belongs_to_creator,
           if: -> { permit_application_id.present? }

  validates :service_partner, presence: true
  # Note: eula_accepted and consent_to_send_drawings are validated on the frontend
  # Backend validations are not enforced to allow progressive form completion

  delegate :permit_project_title, to: :permit_application, allow_nil: true

  def search_data
    {
      id: id,
      cert_number: cert_number,
      full_address: full_address,
      phase: phase,
      service_partner: service_partner,
      creator_id: creator_id,
      created_at: created_at,
      updated_at: updated_at,
      permit_project_id: permit_project&.id,
      jurisdiction_id: jurisdiction&.id,
      permit_application_id: permit_application_id
    }
  end

  private

  def permit_application_belongs_to_creator
    return if creator_id.blank?

    submitter_id = permit_application&.submitter_id
    return if submitter_id.nil? || submitter_id == creator_id

    errors.add(:permit_application, :invalid)
  end
end

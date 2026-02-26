class OverheatingCode < ApplicationRecord
  # searchkick must be declared before Discard::Model to ensure auto-callbacks register correctly
  searchkick word_middle: %i[
               issued_to
               project_number
               building_model
               full_address
             ]

  include Discard::Model

  attribute :status, :integer
  enum :status, { draft: 0, submitted: 1 }

  # [OVERHEATING TODO] Units field purpose unclear — btuh is already labeled on the capacity input
  attribute :cooling_zone_units, :integer
  enum :cooling_zone_units, { imperial: 0, metric: 1 }, prefix: true

  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :jurisdiction, optional: true

  validates :creator, presence: true
  validates :postal_code,
            format: {
              with: /\AV\d[A-Z]\s?\d[A-Z]\d\z/i,
              message: "must be a valid BC postal code (e.g. V7L 1C3)"
            },
            allow_blank: true

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at

  def search_data
    {
      issued_to: issued_to,
      project_number: project_number,
      building_model: building_model,
      full_address: full_address,
      creator_id: creator_id,
      discarded: discarded_at.present?,
      created_at: created_at,
      updated_at: updated_at
    }
  end

  private

  def refresh_search_index
    OverheatingCode.search_index.refresh
  end
end

class OverheatingCode < ApplicationRecord
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
end

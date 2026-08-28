class JurisdictionEnablementEvent < ApplicationRecord
  belongs_to :jurisdiction

  enum :feature, { inbox: 0 }
  enum :source, { seeded: 0, observed: 1, inferred: 2 }

  validates :occurred_at, presence: true
  validates :source, presence: true
  validates :feature, presence: true
  validates :enabled, inclusion: { in: [true, false] }

  scope :inbox, -> { where(feature: :inbox) }
  scope :chronological, -> { order(:occurred_at, :created_at) }

  def self.record_observed!(jurisdiction, enabled:, at: Time.current)
    create!(
      jurisdiction: jurisdiction,
      feature: :inbox,
      enabled: enabled,
      occurred_at: at,
      source: :observed
    )
  end
end

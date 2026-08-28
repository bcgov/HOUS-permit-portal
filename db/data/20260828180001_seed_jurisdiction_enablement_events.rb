# frozen_string_literal: true

class SeedJurisdictionEnablementEvents < ActiveRecord::Migration[7.2]
  CSV_PATH = Rails.root.join("data/jurisdiction_inbox_enablement_dates.csv")

  def up
    return unless table_exists?(:jurisdiction_enablement_events)

    seed_from_csv
    infer_missing_enabled_jurisdictions
  end

  def down
    JurisdictionEnablementEvent.where(source: %i[seeded inferred]).delete_all
  end

  private

  def seed_from_csv
    return unless File.exist?(CSV_PATH)

    require "csv"
    CSV.foreach(CSV_PATH, headers: true) do |row|
      slug = row["slug"].to_s.strip
      enabled_on = row["enabled_on"].to_s.strip
      next if slug.blank? || enabled_on.blank?

      jurisdiction = Jurisdiction.find_by(slug: slug)
      next unless jurisdiction

      occurred_at = Time.zone.parse(enabled_on)
      next unless occurred_at

      already_seeded =
        jurisdiction.jurisdiction_enablement_events.inbox.exists?(
          occurred_at: occurred_at,
          source: :seeded
        )
      next if already_seeded

      jurisdiction.jurisdiction_enablement_events.create!(
        feature: :inbox,
        enabled: true,
        occurred_at: occurred_at,
        source: :seeded
      )
    end
  end

  def infer_missing_enabled_jurisdictions
    Jurisdiction
      .where(inbox_enabled: true)
      .where
      .missing(:jurisdiction_enablement_events)
      .find_each do |jurisdiction|
        occurred_at =
          jurisdiction.jurisdiction_memberships.minimum(:created_at) ||
            jurisdiction.created_at
        next unless occurred_at

        jurisdiction.jurisdiction_enablement_events.create!(
          feature: :inbox,
          enabled: true,
          occurred_at: occurred_at,
          source: :inferred
        )
      end
  end
end

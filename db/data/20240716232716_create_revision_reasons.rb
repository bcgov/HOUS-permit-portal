# frozen_string_literal: true

class CreateRevisionReasons < ActiveRecord::Migration[7.1]
  def up
    site_configuration = SiteConfiguration.instance

    site_configuration.revision_reasons.create(
      [
        { reason_code: "zoning_non_compliance", description: "Zoning non-compliance" },
        { reason_code: "inaccurate_documentation", description: "Inaccurate documentation" },
        { reason_code: "failure_to_meet_building_code", description: "Failure to meet building code requirements" },
        { reason_code: "other", description: "Other" },
      ],
    )
  end

  def down
    RevisionReason.where(
      reason_code: %w[zoning_non_compliance inaccurate_documentation failure_to_meet_building_code other],
    ).destroy_all
  end
end

class RevisionReasonSeeder
  def self.seed
    revision_reasons = [
      {
        reason_code: "zoning_non_compliance",
        description: "Zoning non-compliance"
      },
      {
        reason_code: "inaccurate_documentation",
        description: "Inaccurate documentation"
      },
      {
        reason_code: "failure_to_meet_building_code",
        description: "Failure to meet building code requirements"
      },
      { reason_code: "other", description: "Other" }
    ]

    revision_reasons.each do |reason|
      SiteConfiguration
        .instance
        .revision_reasons
        .find_or_create_by(
          reason_code: reason[:reason_code]
        ) do |revision_reason|
          revision_reason.description = reason[:description]
        end
    end
  end
end

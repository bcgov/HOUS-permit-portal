class PermitClassificationSeeder
  def self.seed
    # Define Classification data
    classifications = [
      {
        name: "1-4 Unit detached housing",
        code: "low_residential",
        description: "1-4 units: Detatched dwellings, duplexes",
        enabled: true,
        type: "PermitType",
      },
      {
        name: "4+ Unit housing",
        code: "medium_residential",
        description: "Part 9 townhouses, small apartment buildings",
        enabled: false,
        type: "PermitType",
      },
      {
        name: "High density appartment buildings",
        code: "high_residential",
        description: "Highest density residential structures",
        enabled: false,
        type: "PermitType",
      },
      {
        name: "New Construction",
        code: "new_construction",
        description:
          "Includes the addition to an existing building (infill development) but not the renovation of an existing home to include a secondary suite.",
        enabled: true,
        type: "Activity",
      },
      {
        name: "Addition, Alteration, or Renovation",
        code: "addition_alteration_renovation",
        description:
          "Modification of an existing residential dwelling to include a (secondary) suite (within the existing building footprint).",
        enabled: false,
        type: "Activity",
      },
      {
        name: "Site Alteration",
        code: "site_alteration",
        description: "Lorem ipsum TODO add description",
        enabled: false,
        type: "Activity",
      },
      {
        name: "Demolition",
        code: "demolition",
        description: "Lorem ipsum TODO add description",
        enabled: false,
        type: "Activity",
      },
    ]

    # Create Classifications
    classifications.each do |classification_attrs|
      # Attempt to find the Activity by code
      classification = PermitClassification.find_by(code: classification_attrs[:code])
      if classification
        # If found, update the attributes
        classification.update(classification_attrs)
      else
        # If not found, create the Activity with all attributes
        PermitClassification.create!(classification_attrs)
      end
    end
  end
end

class PermitClassificationSeeder
  def self.seed
    # Define Classification data
    classifications = [
      {
        name: "Low Density Residential",
        code: "low_residential",
        description: "1-2 units: Detatched dwellings, duplexes",
        enabled: true,
        type: "PermitType",
      },
      {
        name: "Medium Density Residential",
        code: "medium_residential",
        description: "Lorem ipsum medium residential",
        enabled: true,
        type: "PermitType",
      },
      {
        name: "High Density Residential",
        code: "high_residential",
        description: "Lorem ipsum high residential",
        enabled: true,
        type: "PermitType",
      },
      {
        name: "New Construction",
        code: "new_construction",
        description: "Lorem ipsum some kind of activity",
        enabled: true,
        type: "Activity",
      },
      {
        name: "Addition, Alteration, or Renovation",
        code: "addition_alteration_renovation",
        description: "Lorem ipsum some kind of activity",
        enabled: false,
        type: "Activity",
      },
      {
        name: "Site Alteration",
        code: "site_alteration",
        description: "Lorem ipsum some kind of activity",
        enabled: false,
        type: "Activity",
      },
      {
        name: "Demolition",
        code: "demolition",
        description: "Lorem ipsum some kind of activity",
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

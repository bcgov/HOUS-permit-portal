class PermitClassificationSeeder
  def self.seed
    # Define Classification data
    classifications = [
      {
        name: "Small-scale/Multi-unit housing (Part 9 BCBC)",
        code: "low_residential",
        description:
          "Single detached, duplex, triplex / fourplex / townhouse, secondary suite, accessory dwelling unit (ADU) e.g. garden suite",
        enabled: true,
        type: "PermitType"
      },
      {
        name: "4+ Unit housing",
        code: "medium_residential",
        description: "Part 9 townhouses, small apartment buildings",
        enabled: false,
        type: "PermitType"
      },
      {
        name: "High density apartment buildings",
        code: "high_residential",
        description: "Highest density residential structures",
        enabled: true,
        type: "PermitType"
      },
      {
        name: "New Construction",
        code: "new_construction",
        description:
          "Includes the addition to an existing building (infill development) but not the renovation of an existing home to include a secondary suite.",
        enabled: true,
        type: "Activity"
      },
      {
        name: "Addition, Alteration, or Renovation",
        code: "addition_alteration_renovation",
        description:
          "Modification of an existing residential dwelling to include a (secondary) suite (within the existing building footprint).",
        enabled: true,
        type: "Activity"
      },
      {
        name: "Site Alteration",
        code: "site_alteration",
        description:
          "Modifies land contours through grading, excavation, or preparation for construction projects. This process involves adjusting the earth to support new structures or landscaping.",
        enabled: true,
        type: "Activity"
      },
      {
        name: "Demolition",
        code: "demolition",
        description:
          "Involves the systematic tearing down of buildings and other structures, including clearing debris and preparing the site for future construction or restoration activities.",
        enabled: true,
        type: "Activity"
      }
    ]

    # Create Classifications
    classifications.each do |classification_attrs|
      # Attempt to find the Activity by code
      classification =
        PermitClassification.find_by(code: classification_attrs[:code])
      if classification
        # If found, update the attributes
        classification.update(classification_attrs)
      else
        # If not found, create the Activity with all attributes
        PermitClassification.create!(classification_attrs)
      end
    end

    PermitApplication.reindex
    RequirementTemplate.reindex
  end
end

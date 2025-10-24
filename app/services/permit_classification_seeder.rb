class PermitClassificationSeeder
  def self.seed
    # Define Classification data
    classifications = [
      {
        name: "Small-scale/Multi-unit housing (Part 9 BCBC)",
        code: "low_residential",
        description_html:
          "<p>Single detached, duplex, triplex / fourplex / townhouse, secondary suite, accessory dwelling unit (ADU) e.g. garden suite</p>",
        enabled: true,
        type: "PermitType"
      },
      {
        name: "4+ Unit housing",
        code: "medium_residential",
        description_html: "<p>Part 9 townhouses, small apartment buildings</p>",
        enabled: true,
        type: "PermitType"
      },
      {
        name: "High density apartment buildings",
        code: "high_residential",
        description_html: "<p>Highest density residential structures</p>",
        enabled: true,
        type: "PermitType"
      },
      {
        name: "New construction",
        code: "new_construction",
        description_html:
          "<p>Includes the addition to an existing building (infill development) but not the renovation of an existing home to include a secondary suite.</p>",
        enabled: true,
        type: "Activity",
        category: "buildings_and_structures"
      },
      {
        name: "Renovation, alteration, or addition",
        code: "addition_alteration_renovation",
        description_html:
          "<p>Modification of an existing residential dwelling to include a (secondary) suite (within the existing building footprint).</p>",
        enabled: true,
        type: "Activity",
        category: "buildings_and_structures"
      },
      {
        name: "Manufactured home",
        code: "manufactured_home",
        description_html: "<p></p>",
        enabled: true,
        type: "Activity",
        category: "buildings_and_structures"
      },
      {
        name: "Site Alteration",
        code: "site_alteration",
        description_html:
          "<p>Modifies land contours through grading, excavation, or preparation for construction projects. This process involves adjusting the earth to support new structures or landscaping.</p>",
        enabled: true,
        type: "Activity"
      },
      {
        name: "Demolition",
        code: "demolition",
        description_html:
          "<p>Involves the systematic tearing down of buildings and other structures, including clearing debris and preparing the site for future construction or restoration activities.</p>",
        enabled: true,
        type: "Activity",
        category: "site_preparation"
      },
      {
        name: "Tree-cutting and tree removal",
        code: "tree_cutting_and_tree_removal",
        description_html: "<p></p>",
        enabled: true,
        type: "Activity",
        category: "site_preparation"
      },
      {
        name: "Retaining wall",
        code: "retaining_wall",
        description_html: "<p></p>",
        enabled: true,
        type: "Activity",
        category: "site_preparation"
      },
      {
        name: "Relocation",
        code: "relocation",
        description_html: "<p></p>",
        enabled: true,
        type: "Activity",
        category: "site_preparation"
      },
      {
        name: "Mechanical",
        code: "mechanical",
        description_html:
          "<p>Install, change, or repair heating, ventilation, or air conditioning (HVAC) systems.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
      },
      {
        name: "Plumbing",
        code: "plumbing",
        description_html:
          "<p>Install, change, or repair plumbing systems, including water supply, drainage, and services to a building.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
      },
      {
        name: "Electrical",
        code: "electrical",
        description_html:
          "<p>Electrical work, including installation, changes, or repairs to wiring, panels, or lighting. Applies to both permanent and temporary services.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
      },
      {
        name: "Gas",
        code: "gas",
        description_html:
          "<p>Install, change, or repair gas piping, appliances, venting, or connections.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
      },
      {
        name: "Solid fuel burning appliance",
        code: "solid_fuel_burning_appliance",
        description_html:
          "<p>Install, change, or repair a wood stove, pellet stove, or another solid fuel-burning appliance.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
      },
      {
        name: "Fire alarm",
        code: "fire_alarm",
        description_html:
          "<p>Install, change, or repair a fire alarm system, including detectors, panels, and wiring.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
      },
      {
        name: "Fire suppression",
        code: "fire_suppression",
        description_html:
          "<p>Install, change, or repair a sprinkler or other fire suppression system in a building.</p>",
        enabled: true,
        type: "Activity",
        category: "trades"
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

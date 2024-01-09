class PermitClassificationSeeder
  def self.seed
    # Define PermitType data
    permit_types = [
      { name: "Low Residential", code: "low_residential" },
      { name: "Medium Residential", code: "medium_residential" },
      { name: "High Residential", code: "high_residential" },
    ]

    # Create PermitTypes
    permit_types.each { |pt_attrs| PermitType.find_or_create_by!(pt_attrs) }

    # Define Activity data
    activities = [
      { name: "New Construction", code: "new_construction" },
      { name: "Addition, Alteration, or Renovation", code: "addition_alteration_renovation" },
      { name: "Site Alteration", code: "site_alteration" },
      { name: "Demolition", code: "demolition" },
    ]

    # Create Activities
    activities.each { |activity_attrs| Activity.find_or_create_by!(activity_attrs) }
  end
end

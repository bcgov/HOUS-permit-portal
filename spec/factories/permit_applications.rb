FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction

    # Dynamic attribute for building_type association
    building_type do
      # Define the traits as symbols
      building_type_traits = %i[
        detached
        semi_detached
        secondary_suite
        small_apartment
        residential_accessory_dwelling_unit
        non_residential_accessory_dwelling_unit
      ]

      # Select a random trait
      selected_trait = building_type_traits.sample

      # Create the building_type with the selected trait
      FactoryBot.create(:building_type, selected_trait)
    end

    work_type do
      # Define the traits as symbols
      work_type_traits = %i[
        new_construction
        addition_alteration_renovation
        site_alterations_landscaping
        demolition_of_existing_buildings
      ]

      # Select a random trait
      selected_trait = work_type_traits.sample

      # Create the work_type with the selected trait
      FactoryBot.create(:work_type, selected_trait)
    end
  end
end

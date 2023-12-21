FactoryBot.define do
  factory :building_type, class: "ResidentialBuildingType" do
    trait :detached do
      name { "Detached" }
      description { "With or without secondary suite" }
      type { "ResidentialBuildingType" }
    end

    trait :semi_detached do
      name { "Semi-Detached" }
      description { "House, duplex, townhome, or rowhome" }
      type { "ResidentialBuildingType" }
    end

    trait :secondary_suite do
      name { "Secondary Suite" }
      description { "Secondary suite" }
      type { "ResidentialBuildingType" }
    end

    trait :small_apartment do
      name { "Small Apartment" }
      description { "Triplex, fourplex, 2-4 unit" }
      type { "ResidentialBuildingType" }
    end

    trait :residential_accessory_dwelling_unit do
      name { "Residential Accessory Dwelling Unit" }
      description { "Garden Suite, laneway house, carriage house, coach home, manufactured home/pre-fab" }
      type { "ResidentialBuildingType" }
    end

    trait :non_residential_accessory_dwelling_unit do
      name { "Non-Residential Accessory Dwelling Unit" }
      description { "garage, sheds over 10m2 on the same property, swimming pool, etc." }
      type { "ResidentialBuildingType" }
    end
  end
end

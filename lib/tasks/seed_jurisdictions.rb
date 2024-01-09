namespace :db do
  desc "Seed jurisdictions"
  task seed_jurisdictions: :environment do
    puts "Seeding jurisdictions..."
    JurisdictionSeeder.seed
    puts "Jurisdictions seeded successfully."
  end
end

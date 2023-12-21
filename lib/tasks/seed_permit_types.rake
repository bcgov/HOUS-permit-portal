namespace :db do
  desc "Ensure specific building type records are seeded"
  task seed_building_types: :environment do
    PermitTypeSeeder.run
  end
end

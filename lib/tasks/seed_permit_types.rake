namespace :db do
  desc "Ensure specific building type records are seeded"
  task seed_permit_templates: :environment do
    PermitTypeSeeder.run
  end
end

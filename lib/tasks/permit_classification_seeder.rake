namespace :db do
  desc "Seed permit classifications"
  task seed_permit_classifications: :environment do
    PermitClassificationSeeder.seed
  end
end

namespace :db do
  desc "Run all necessary seeders and updaters to initially populate production"
  task seed_prod: :environment do
    # PRIOR TO RUNNING:
    # Upload user_data.csv file with:
    # oc rsync ~/directory/containing/csv/ <YOUR POD>:/app/tmp/
    # eg:
    # oc rsync ~/seeds/HOUS-permit-portal/TEST/ test-hous-permit-portal-6b7dc5bff8-z48wq:/app/tmp/
    
    # puts "Seeding from manually uploaded user_data.csv..."
    # Rake::Task["db:sensitive_seeder"].invoke
    User.reindex

    puts "Seeding permit classifications..."
    PermitClassificationSeeder.seed

    puts "Seeding EULA..."
    EulaUpdater.run

    puts "Seeding jurisdictions..."
    JurisdictionSeeder.seed
    Jurisdiction.reindex

    puts "Seeding requirements..."
    RequirementsFromXlsxSeeder.seed

    puts "Seeding step code reference tables..."
    StepCode::Part9::MEUIReferencesSeeder.seed!
    StepCode::Part9::TEDIReferencesSeeder.seed!

    puts "Seeding default revision reasons..."
    RevisionReasonSeeder.seed
  end
end

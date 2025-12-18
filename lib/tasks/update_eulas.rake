namespace :db do
  desc "Create or update End User License Agreements"
  task update_eulas: :environment do
    EulaUpdater.run(should_override_existing: false)
  end
end

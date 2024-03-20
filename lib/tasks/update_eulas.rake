namespace :db do
  desc "Create or update End User License Agreements"
  task update_eulas: :environment do
    EulaUpdater.run
  end
end

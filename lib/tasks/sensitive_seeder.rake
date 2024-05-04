# lib/tasks/sensitive_seeder.rake
namespace :db do
  desc "Seed sensitive user data from a CSV file"
  task sensitive_seeder: :environment do
    require "csv"

    # Upload the file with:
    # oc rsync ~/directory/containing/csv/ <YOUR POD>:/app/tmp/
    # eg:
    # oc rsync ~/seeds/HOUS-permit-portal/TEST/ test-hous-permit-portal-6b7dc5bff8-z48wq:/app/tmp/
    csv_file_path = Rails.root.join("tmp", "user_data.csv")

    i = 0
    # Will acquire 3 jurisdictions because Nanaimo is 2
    jurisdictions = Jurisdiction.where(name: %w[Nanaimo Vancouver])
    CSV.foreach(csv_file_path, headers: true) do |row|
      # first_name,last_name,bceid_email,bceid_username,role,bceid_uid
      if row["role"] == "reviewer" || row["role"] == "review_manager"
        j = jurisdictions[i % 3]
        i += 1
      end
      User.create!(
        first_name: row["first_name"],
        last_name: row["last_name"],
        email: row["bceid_email"],
        nickname: row["bceid_username"],
        role: row["role"],
        password: Devise.friendly_token[0, 20],
        jurisdiction: j,
        uid: row["bceid_uid"],
        provider: "keycloak",
        bceid_email: row["bceid_email"],
        bceid_username: row["bceid_username"]
      ).confirm
    rescue ActiveRecord::RecordInvalid => e
      puts "Skipping invalid user record: #{e.message}"
    end

    User.where("email LIKE ?", "%example.com").destroy_all
  end
end

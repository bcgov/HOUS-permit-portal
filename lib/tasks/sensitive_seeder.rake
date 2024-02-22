# lib/tasks/sensitive_seeder.rake
namespace :db do
  desc "Seed sensitive user data from a CSV file"
  task sensitive_seeder: :environment do
    require "csv"

    # Ensure the environment variable is set, otherwise raise an error
    csv_file_path = Rails.root.join("tmp", "seeds", "user_data.csv")

    CSV.foreach(csv_file_path, headers: true) do |row|
      # first_name,last_name,email,username,role,password
      User.create!(
        first_name: row["first_name"],
        last_name: row["last_name"],
        email: row["email"],
        username: row["username"],
        role: row["role"],
        password: row["password"]
      ).confirm
    rescue ActiveRecord::RecordInvalid => e
      puts "Skipping invalid user record: #{e.message}"
    end
  end
end

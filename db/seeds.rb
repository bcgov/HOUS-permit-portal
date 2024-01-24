# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

PermitClassificationSeeder.seed

# Creating Jurisdictions
JurisdictionSeeder.seed
jurisdictions = Jurisdiction.all

if User.first.blank?
  5.times do
    FactoryBot.create(:user, :submitter).confirm
    FactoryBot.create(:user, :review_manager, jurisdiction: jurisdictions.first).confirm
    FactoryBot.create(:user, :reviewer, jurisdiction: jurisdictions.first).confirm
    FactoryBot.create(:user, :super_admin).confirm
  end
end

User
  .find_or_create_by(username: "super_admin") do |user|
    user.role = :super_admin
    user.first_name = "SuperAdmin"
    user.last_name = "McUser"
    user.email = "super_admin@example.com"
    user.password = "P@ssword1"
  end
  .confirm

User
  .find_or_create_by(username: "review_manager") do |user|
    user.role = :review_manager
    user.first_name = "ReviewManager"
    user.last_name = "McUser"
    user.email = "review_manager@example.com"
    user.password = "P@ssword1"
    user.jurisdiction = jurisdictions.first
  end
  .confirm

User
  .find_or_create_by(username: "reviewer") do |user|
    user.role = :reviewer
    user.first_name = "Reviewer"
    user.last_name = "McUser"
    user.email = "reviewer@example.com"
    user.password = "P@ssword1"
    user.jurisdiction = jurisdictions.first
  end
  .confirm

User
  .find_or_create_by(username: "reviewer") do |user|
    user.role = :submitter
    user.first_name = "Submitter"
    user.last_name = "McUser"
    user.email = "submitter@example.com"
    user.password = "P@ssword1"
  end
  .confirm

PermitClassificationSeeder.seed
activity1 = Activity.find_by_code("new_construction")
activity2 = Activity.find_by_code("demolition")

# Create PermitType records
permit_type1 = PermitType.find_by_code("low_residential")
permit_type2 = PermitType.find_by_code("medium_residential")

if PermitApplication.first.blank?
  jurisdictions.each { |j| (rand(3..5).times { FactoryBot.create(:contact, jurisdiction: j) }) if j.contacts.blank? }
  # Creating Permit Applications
  submitters = User.where(role: "submitter")
  20.times do
    FactoryBot.create(
      :permit_application,
      submitter: submitters.sample,
      jurisdiction: jurisdictions.sample,
      activity: activity1,
      permit_type: permit_type1,
    )
  end
  # Seed a North Vancouver Example
  4.times do
    j = Jurisdiction.where(name: "North Vancouver").sample
    pid = (j.locality_type == "corporation of the city") ? "013228544" : "008535981"
    full_address =
      (
        if (j.locality_type == "corporation of the city")
          "323 18TH ST E, NORTH VANCOUVER, BC, V7L 2X8"
        else
          "5419 ESPERANZA DR, NORTH VANCOUVER, BC, V7R 3W3"
        end
      )
    FactoryBot.create(
      :permit_application,
      submitter: submitters.sample,
      jurisdiction: j,
      activity: activity1,
      permit_type: permit_type1,
      full_address: full_address,
      pid: pid,
    )
  end
end

# Create RequirementTemplate records
RequirementTemplate.find_or_create_by!(activity: activity1, permit_type: permit_type1)
RequirementTemplate.find_or_create_by!(activity: activity1, permit_type: permit_type2)
RequirementTemplate.find_or_create_by!(activity: activity2, permit_type: permit_type1)
RequirementTemplate.find_or_create_by!(activity: activity2, permit_type: permit_type2)

# Requrements from seeder are idempotent
# Requirments block will get created from requiremetms templates
RequirementsFromXlsxSeeder.seed

User.reindex

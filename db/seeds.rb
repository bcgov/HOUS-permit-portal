# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Creating Jurisdictions
5.times { FactoryBot.create(:jurisdiction) }

user = User.find_by(email: "admin@example.com")

unless user
  FactoryBot.create(
    :user,
    :super_admin,
    email: "admin@example.com",
    username: "admin@example.com",
    password: "P@ssword1",
  ).confirm
end

# Creating Users with different roles
5.times do
  FactoryBot.create(:user, :submitter).confirm
  FactoryBot.create(:user, :review_manager).confirm
  FactoryBot.create(:user, :reviewer).confirm
  FactoryBot.create(:user, :super_admin).confirm
end

# Creating Permit Applications
jurisdictions = Jurisdiction.all
submitters = User.where(role: "submitter")

20.times { FactoryBot.create(:permit_application, submitter: submitters.sample, jurisdiction: jurisdictions.sample) }

# Creating Contacts
jurisdictions.each { |j| rand(3..5).times { FactoryBot.create(:contact, jurisdiction: j) } }

PermitClassificationSeeder.seed

activity1 = Activity.find_by_code("new_construction")
activity2 = Activity.find_by_code("demolition")

# Create PermitType records
permit_type1 = PermitType.find_by_code("low_residential")
permit_type2 = PermitType.find_by_code("high_residential")

# Create RequirementTemplate records
RequirementTemplate.find_or_create_by!(activity: activity1, permit_type: permit_type1)
RequirementTemplate.find_or_create_by!(activity: activity1, permit_type: permit_type2)
RequirementTemplate.find_or_create_by!(activity: activity2, permit_type: permit_type1)
RequirementTemplate.find_or_create_by!(activity: activity2, permit_type: permit_type2)

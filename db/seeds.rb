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
JurisdictionSeeder.seed
jurisdictions = Jurisdiction.all

if User.all.blank?
  5.times do
    FactoryBot.create(:user, :submitter).confirm
    FactoryBot.create(:user, :review_manager, jurisdiction: jurisdictions.first).confirm
    FactoryBot.create(:user, :reviewer, jurisdiction: jurisdictions.first).confirm
    FactoryBot.create(:user, :super_admin).confirm
  end
end

User.find_or_create_by(username: "admin") do |user|
  user.role = :super_admin
  user.email = "admin@example.com"
  user.password = "P@ssword1"
end

User.find_or_create_by(username: "review_manager") do |user|
  user.role = :review_manager
  user.email = "review_manager@example.com"
  user.password = "P@ssword1"
  user.jurisdiction = jurisdictions.first
end

User.find_or_create_by(username: "reviewer") do |user|
  user.role = :reviewer
  user.email = "reviewer@example.com"
  user.password = "P@ssword1"
  user.jurisdiction = jurisdictions.first
end

# Creating Permit Applications
submitters = User.where(role: "submitter")

if PermitApplication.all.blank?
  20.times { FactoryBot.create(:permit_application, submitter: submitters.sample, jurisdiction: jurisdictions.sample) }

  # Creating Contacts
  jurisdictions.each { |j| rand(3..5).times { FactoryBot.create(:contact, jurisdiction: j) } }
end

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

if RequirementBlock.all.blank?
  25.times do |i|
    RequirementBlock.create!(
      name: "Block #{i + 1}",
      sign_off_role: 0,
      reviewer_role: 0,
      custom_validations: {
        key: "value",
      },
    )
  end
end

User.reindex

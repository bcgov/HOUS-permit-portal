# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

puts "Seeding permit classifications..."
PermitClassificationSeeder.seed

puts "Seeding jurisdictions..."

# Creating Jurisdictions
JurisdictionSeeder.seed
jurisdictions = Jurisdiction.all

north_van = Jurisdiction.find_by(name: "North Vancouver")

puts "Seeding users..."
5.times do |n|
  suffix = n == 0 ? "" : n
  User.find_or_create_by(username: "super_admin#{suffix}") do |user|
    user.role = :super_admin
    user.first_name = "SuperAdmin#{suffix}"
    user.last_name = "McUser"
    user.email = "super_admin#{suffix}@example.com"
    user.password = "P@ssword1"
    user.confirmed_at = Time.now
  end

  User.find_or_create_by(username: "review_manager#{suffix}") do |user|
    user.role = :review_manager
    user.first_name = "ReviewManager#{suffix}"
    user.last_name = "McUser"
    user.email = "review_manager#{suffix}@example.com"
    user.password = "P@ssword1"
    user.jurisdiction = north_van
    user.confirmed_at = Time.now
  end

  User.find_or_create_by(username: "reviewer#{suffix}") do |user|
    user.role = :reviewer
    user.first_name = "Reviewer#{suffix}"
    user.last_name = "McUser"
    user.email = "reviewer#{suffix}@example.com"
    user.password = "P@ssword1"
    user.jurisdiction = north_van
    user.confirmed_at = Time.now
  end

  User.find_or_create_by(username: "submitter#{suffix}") do |user|
    user.role = :submitter
    user.first_name = "Submitter#{suffix}"
    user.last_name = "McUser"
    user.email = "submitter#{suffix}@example.com"
    user.password = "P@ssword1"
    user.confirmed_at = Time.now
  end
end

User.reindex

activity1 = Activity.find_by_code("new_construction")
activity2 = Activity.find_by_code("demolition")

# Create PermitType records
permit_type1 = PermitType.find_by_code("low_residential")
permit_type2 = PermitType.find_by_code("medium_residential")

puts "Seeding contacts..."
if PermitApplication.first.blank?
  jurisdictions
    .first(10)
    .each do |jurisdiction|
      if jurisdiction.contacts.blank?
        rand(3..5).times do |n|
          Contact.create(
            name: "Contact #{n}",
            title: "Title #{n}",
            department: "Department #{n}",
            email: "contact_#{n}_#{jurisdiction.id}@example.com",
            phone_number: "604-456-7802",
            jurisdiction_id: jurisdiction.id,
          )
        end
      end
    end

  puts "Seeding requirement templates..."
  # Create RequirementTemplate records
  RequirementTemplate.find_or_create_by!(activity: activity1, permit_type: permit_type1)
  RequirementTemplate.find_or_create_by!(activity: activity1, permit_type: permit_type2)
  RequirementTemplate.find_or_create_by!(activity: activity2, permit_type: permit_type1)
  RequirementTemplate.find_or_create_by!(activity: activity2, permit_type: permit_type2)
  RequirementTemplate.reindex

  # Requrements from seeder are idempotent
  # Requirments block will get created from requiremetms templates
  puts "Seeding requirements..."
  RequirementsFromXlsxSeeder.seed

  # Energy Step Code Reference Tables
  StepCode::MEUIReferencesSeeder.seed!
  StepCode::TEDIReferencesSeeder.seed!

  # Creating Permit Applications
  puts "Seeding permit applications..."
  submitters = User.submitter
  rt = RequirementTemplate.with_published_version.first.published_template_version
  20.times do |index|
    PermitApplication.create(
      submitter_id: submitters.sample.id,
      full_address: "123 Address st",
      pid: "999999999",
      jurisdiction_id: index.even? ? jurisdictions.sample.id : north_van.id,
      activity_id: rt.activity.id,
      permit_type_id: rt.permit_type.id,
    )
  end
  # Seed a North Vancouver Example
  4.times do
    pid =
      (
        if (north_van.locality_type == "corporation of the city")
          "013228544"
        else
          "008535981"
        end
      )
    full_address =
      (
        if (north_van.locality_type == "corporation of the city")
          "323 18TH ST E, NORTH VANCOUVER, BC, V7L 2X8"
        else
          "5419 ESPERANZA DR, NORTH VANCOUVER, BC, V7R 3W3"
        end
      )
    PermitApplication.create(
      submitter: submitters.sample,
      jurisdiction: north_van,
      activity: activity1,
      permit_type: permit_type1,
      full_address: full_address,
      pid: pid,
    )
  end
end

puts "Seeding jurisdiction customizations..."
TemplateVersion
  .limit(3)
  .each do |template_version|
    JurisdictionTemplateVersionCustomization.find_or_create_by(
      jurisdiction: north_van,
      template_version: template_version,
    ) do |customization|
      # any other data to add
    end
  end

puts "Seeding EULA..."
EulaUpdater.run

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

north_van =
  Jurisdiction.find_by(
    name: "North Vancouver",
    locality_type: "corporation of the city"
  )

north_van.update(external_api_state: :j_on)

van = Jurisdiction.find_by(name: "Vancouver")

# Seed Archistar enrollment for North Vancouver
JurisdictionServicePartnerEnrollment.find_or_create_by(
  jurisdiction: north_van,
  service_partner: :archistar
) { |enrollment| enrollment.enabled = true }
puts "  ✓ Created Archistar enrollment for North Vancouver"

puts "Seeding users..."
User.find_or_create_by(omniauth_username: "super_admin") do |user|
  user.role = :super_admin
  user.first_name = "SuperAdmin"
  user.last_name = "McUser"
  user.email = "super_admin@example.com"
  user.password = "P@ssword1"
  user.confirmed_at = Time.now
  user.omniauth_uid = "A41927C69D6549B8A396FCA748F53502"
  user.omniauth_provider = "bceidbasic"
  user.omniauth_email = "super_admin@example.com"
  user.omniauth_username = "super_admin"
end

User.find_or_create_by(omniauth_username: "review_manager") do |user|
  user.role = :review_manager
  user.first_name = "ReviewManager"
  user.last_name = "McUser"
  user.email = "review_manager@example.com"
  user.password = "P@ssword1"
  user.jurisdictions = [north_van]
  user.confirmed_at = Time.now
  user.omniauth_uid = "85EEC5B6F05A4DB7BB5BB97FBC6985B1"
  user.omniauth_provider = "bceidbasic"
  user.omniauth_email = "review_manager@example.com"
end

User.find_or_create_by(omniauth_username: "regional_review_manager") do |user|
  user.role = :regional_review_manager
  user.first_name = "RegionalReviewManager"
  user.last_name = "McUser"
  user.email = "regional_review_manager@example.com"
  user.password = "P@ssword1"
  user.jurisdictions = [north_van, van]
  user.confirmed_at = Time.now
  user.omniauth_uid = "08B5EED1DB3E42909CB050FFAA600145"
  user.omniauth_provider = "bceidbasic"
  user.omniauth_email = "regional_review_manager@example.com"
  user.omniauth_username = "regional_rm"
end

User.find_or_create_by(omniauth_username: "reviewer") do |user|
  user.role = :reviewer
  user.first_name = "Reviewer"
  user.last_name = "McUser"
  user.email = "reviewer@example.com"
  user.password = "P@ssword1"
  user.jurisdictions = [north_van]
  user.confirmed_at = Time.now
  user.omniauth_uid = "8505910FBD594495AC899BC6653F3544"
  user.omniauth_provider = "bceidbasic"
  user.omniauth_email = "reviewer@example.com"
end

User.find_or_create_by(omniauth_username: "submitter") do |user|
  user.role = :submitter
  user.first_name = "Submitter"
  user.last_name = "McUser"
  user.email = "submitter@example.com"
  user.password = "P@ssword1"
  user.confirmed_at = Time.now
  user.omniauth_uid = "C2E3AA0067514FFEB587C11038E437E2"
  user.omniauth_provider = "bceidbasic"
  user.omniauth_email = "submitter@example.com"
end

4.times do |i|
  User.find_or_create_by(email: "submitter_#{i + 1}@example.com") do |user|
    user.role = :submitter
    user.first_name = "Submitter"
    user.last_name = "Number#{i + 1}"
    user.password = "P@ssword1"
    user.confirmed_at = Time.now
  end
end

# invite a usable super admin
# safeguard for development only
if Rails.env.development?
  email = "usable+super_admin@example.com"
  User.invite!(email: email) do |u|
    u.skip_confirmation_notification!
    u.role = :super_admin
    u.first_name = "Super"
    u.last_name = "Admin"
    u.save
  end
end

User.reindex

activity1 = Activity.find_by_code("new_construction")
activity2 = Activity.find_by_code("demolition")

# Create PermitType records
permit_type1 = PermitType.find_by_code("low_residential")
permit_type2 = PermitType.find_by_code("medium_residential")

puts "Seeding contacts..."
Jurisdiction.all.each do |j|
  PermitType.find_each do |permit_type|
    j
      .permit_type_submission_contacts
      .where(
        email: "#{j.name.parameterize}@laterolabs.com",
        permit_type: permit_type
      )
      .first_or_create!(
        email: "#{j.name.parameterize}@laterolabs.com",
        confirmed_at: Time.now,
        permit_type: permit_type
      )
  end
  j.update(inbox_enabled: true, show_about_page: true)
end
if PermitApplication.first.blank?
  jurisdictions
    .first(10)
    .each do |jurisdiction|
      if jurisdiction.contacts.blank?
        rand(3..5).times do |n|
          Contact.create!(
            first_name: "Contactfirst #{n}",
            last_name: "Contactlast #{n}",
            title: "Title #{n}",
            department: "Department #{n}",
            email: "contact_#{n}_#{jurisdiction.id}@example.com",
            phone: "604-456-7802",
            contactable: jurisdiction
          )
        end
        jurisdiction.reload
        if jurisdiction.permit_type_submission_contacts.blank?
          jurisdiction.permit_type_submission_contacts.create!(
            email: jurisdiction.contacts.first.email,
            confirmed_at: Time.now,
            permit_type: permit_type1
          )
        end
      end
    end

  User
    .submitter
    .first(10)
    .each do |user|
      if user.contacts.blank?
        rand(3..5).times do |n|
          Contact.create!(
            first_name: "Usercontactfirst #{n}",
            last_name: "Usercontactlast #{n}",
            title: "Title #{n}",
            department: "Department #{n}",
            email: "user_contact_#{n}_#{user.id}@example.com",
            address: "Address #{n}",
            phone: "604-456-7802",
            contactable: user
          )
        end
      end
    end
  Contact.reindex
  puts "Seeding requirement templates..."
  # Create LiveRequirementTemplate records
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity1,
    permit_type: permit_type1
  )
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity1,
    permit_type: permit_type2
  )
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity2,
    permit_type: permit_type1
  )
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity2,
    permit_type: permit_type2
  )

  RequirementTemplate.reindex

  PermitTypeRequiredStepSeeder.seed

  # Requrements from seeder are idempotent
  # Requirments block will get created from requiremetms templates
  puts "Seeding requirements..."
  RequirementsFromXlsxSeeder.seed
  if Rails.env.development?
    PermitClassification.find_by_code("medium_residential").update(
      enabled: true
    )
    RequirementsFromXlsxSeeder.seed_medium
  end

  # Remove any invalid records that prevent saving of the template
  RequirementBlock.find_each { |block| block.destroy unless block.valid? }

  # Energy Step Code Reference Tables
  StepCode::Part9::MEUIReferencesSeeder.seed!
  StepCode::Part9::TEDIReferencesSeeder.seed!

  puts "Seeding default fuel types..."
  Part3StepCode::FuelType::DEFAULTS.each do |ft|
    Part3StepCode::FuelType.where(key: ft[:key]).first_or_create!(ft)
  end

  # Creating Permit Applications
  puts "Seeding permit applications..."
  review_managers = User.review_manager
  published_template_versions = TemplateVersion.published
  submitters = User.submitter

  20.times do |index|
    current_review_manager = review_managers.sample
    current_jurisdiction =
      index.even? ? jurisdictions.first(10).sample : north_van
    current_jurisdiction_id = current_jurisdiction.id
    sandbox = current_jurisdiction.sandboxes.find_by(name: "Published")

    permit_project =
      PermitProject.create!(
        owner: current_review_manager,
        jurisdiction_id: current_jurisdiction_id,
        title: "Project for Seed Application #{index + 1}",
        full_address: "123 Seed Street #{index + 1}, Seedville",
        pid: "SEEDPID#{index + 1}",
        pin: "SEEDPIN#{index + 1}"
      )

    # Create one main permit application
    template_version = published_template_versions.sample
    permit_application =
      PermitApplication.create!(
        submitter: current_review_manager,
        permit_project: permit_project,
        activity_id: template_version.activity.id,
        permit_type_id: template_version.permit_type.id,
        template_version: template_version,
        sandbox: sandbox
      )

    # Assign a random collaborator as a submission delegatee to the main application
    collaborator_user = (submitters.to_a - [current_review_manager]).sample
    if collaborator_user
      collaborator =
        Collaborator.find_or_create_by!(
          user: collaborator_user,
          collaboratorable_id: current_review_manager.id,
          collaboratorable_type: "User"
        )
      PermitCollaboration.create!(
        permit_application: permit_application,
        collaborator: collaborator,
        collaboration_type: :submission,
        collaborator_type: :delegatee
      )
    end

    # Create additional draft permits
    rand(2..5).times do
      draft_template_version = published_template_versions.sample
      draft_permit_application =
        PermitApplication.create!(
          submitter: current_review_manager,
          permit_project: permit_project,
          activity_id: draft_template_version.activity.id,
          permit_type_id: draft_template_version.permit_type.id,
          template_version: draft_template_version,
          status: :new_draft,
          sandbox: sandbox
        )
      # Assign a random collaborator as a submission delegatee to the draft application
      collaborator_user = (submitters.to_a - [current_review_manager]).sample
      if collaborator_user
        collaborator =
          Collaborator.find_or_create_by!(
            user: collaborator_user,
            collaboratorable_id: current_review_manager.id,
            collaboratorable_type: "User"
          )
        PermitCollaboration.create!(
          permit_application: draft_permit_application,
          collaborator: collaborator,
          collaboration_type: :submission,
          collaborator_type: :delegatee
        )
      end
    end
  end
  # Seed a North Vancouver Example
  4.times do |i| # Added index i for unique titles if needed
    current_review_manager = review_managers.sample
    sandbox = north_van.sandboxes.find_by(name: "Published")
    project_pid =
      (
        if (north_van.locality_type == "corporation of the city")
          "013228544"
        else
          "008535981"
        end
      )
    project_full_address =
      (
        if (north_van.locality_type == "corporation of the city")
          "323 18th St E, North Vancouver, BC, V7L 2X8"
        else
          "5419 Esperanza Dr, North Vancouver, BC, V7R 3W3"
        end
      )

    permit_project =
      PermitProject.create!(
        owner: current_review_manager,
        jurisdiction: north_van,
        full_address: project_full_address,
        pid: project_pid
      )

    # Create one main permit application
    template_version = published_template_versions.sample
    permit_application =
      PermitApplication.create!(
        nickname: "Permit application #{i + 1}",
        submitter: current_review_manager,
        permit_project: permit_project,
        activity_id: template_version.activity.id,
        permit_type_id: template_version.permit_type.id,
        template_version: template_version,
        sandbox: sandbox
      )

    # Assign a random collaborator as a submission delegatee
    collaborator_user = (submitters.to_a - [current_review_manager]).sample
    if collaborator_user
      collaborator =
        Collaborator.find_or_create_by!(
          user: collaborator_user,
          collaboratorable_id: current_review_manager.id,
          collaboratorable_type: "User"
        )
      PermitCollaboration.create!(
        permit_application: permit_application,
        collaborator: collaborator,
        collaboration_type: :submission,
        collaborator_type: :delegatee
      )
    end

    # Create additional draft permits
    rand(2..5).times do
      draft_template_version = published_template_versions.sample
      draft_permit_application =
        PermitApplication.create!(
          submitter: current_review_manager,
          permit_project: permit_project,
          activity_id: draft_template_version.activity.id,
          permit_type_id: draft_template_version.permit_type.id,
          template_version: draft_template_version,
          status: :new_draft,
          sandbox: sandbox
        )
      # Assign a random collaborator as a submission delegatee to the draft application
      collaborator_user = (submitters.to_a - [current_review_manager]).sample
      if collaborator_user
        collaborator =
          Collaborator.find_or_create_by!(
            user: collaborator_user,
            collaboratorable_id: current_review_manager.id,
            collaboratorable_type: "User"
          )
        PermitCollaboration.create!(
          permit_application: draft_permit_application,
          collaborator: collaborator,
          collaboration_type: :submission,
          collaborator_type: :delegatee
        )
      end
    end
  end
end
PermitApplication.reindex

puts "Seeding jurisdiction customizations..."
TemplateVersion
  .limit(3)
  .each do |tv|
    JurisdictionTemplateVersionCustomization.find_or_create_by!(
      jurisdiction: north_van,
      template_version: tv
    ) do |customization|
      # any other data to add
    end
  end

puts "Seeding EULA..."
EulaUpdater.run

puts "Seeding default revision reasons..."
RevisionReasonSeeder.seed

puts "Seeding early access requirement templates..."

LiveRequirementTemplate.find_each do |lrt|
  overrides = {
    type: EarlyAccessRequirementTemplate.name,
    nickname: "Early access #{lrt.label}"
  }
  RequirementTemplateCopyService.new(
    lrt
  ).build_requirement_template_from_existing(overrides)
end

# Seed some previewers for EarlyAccessRequirementTemplate instances
puts "Seeding Early Access Invitations..."

# Fetching existing EarlyAccessRequirementTemplate instances
early_access_requirement_templates = EarlyAccessRequirementTemplate.limit(3)

# Fetching existing User instances
users = User.limit(5)

# Associate some users as previewers for each template
early_access_requirement_templates.each do |eart|
  # Select a random subset of users to invite (between 1 and 5 users)
  previewers = users.sample(rand(1..5))

  previewers.each do |user|
    EarlyAccessPreview.create!(
      early_access_requirement_template: eart,
      previewer: user
    )
  end
end

if Rails.env.development?
  puts "Ensuring site configuration inbox is enabled for development..."
  site_config = SiteConfiguration.instance
  site_config.update(inbox_enabled: true, code_compliance_enabled: true)
end

puts "Seeding Permit Projects from Permit Applications..."
PermitProjectSeederService.call
PermitProject.reindex

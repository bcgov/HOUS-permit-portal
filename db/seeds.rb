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
north_van&.update(map_position: [49.319981, -123.072414], map_zoom: 13)

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
    permit_type: permit_type1,
    available_globally: true
  )
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity1,
    permit_type: permit_type2,
    available_globally: true
  )
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity2,
    permit_type: permit_type1,
    available_globally: true
  )
  LiveRequirementTemplate.find_or_create_by!(
    activity: activity2,
    permit_type: permit_type2,
    available_globally: true
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
  published_template_versions = TemplateVersion.published
  submitter_user = User.find_by!(omniauth_username: "submitter")

  north_van_streets = [
    "Lonsdale Ave",
    "Chesterfield Ave",
    "St Georges Ave",
    "St Andrews Ave",
    "St Patricks Ave",
    "Ridgeway Ave",
    "Queensbury Ave",
    "Moody Ave",
    "Mahon Ave",
    "Jones Ave",
    "Hamilton Ave",
    "Grand Blvd",
    "Forbes Ave",
    "Eastern Ave",
    "Donaghy Ave",
    "Bewicke Ave",
    "Sutherland Ave",
    "Hendry Ave",
    "Fell Ave",
    "Larson Rd",
    "Westview Dr",
    "Capilano Rd",
    "Mountain Hwy",
    "Lynn Valley Rd",
    "Keith Rd",
    "Marine Dr",
    "3rd St",
    "15th St",
    "21st St",
    "23rd St"
  ]
  north_van_postal = %w[V7M V7L V7K V7J V7N V7P V7G V7H V7R]
  project_types = [
    "Single family home",
    "Duplex renovation",
    "Laneway house",
    "Garage conversion",
    "Deck addition",
    "Kitchen remodel",
    "Basement suite",
    "Roof replacement",
    "Fence & retaining wall",
    "Commercial tenant improvement",
    "4+ Unit housing",
    "Mixed-use development",
    "Accessory dwelling unit"
  ]

  60.times do |index|
    current_jurisdiction =
      index < 45 ? north_van : jurisdictions.first(10).sample
    street = north_van_streets.sample
    street_num = rand(100..9999)
    postal =
      "#{north_van_postal.sample} #{rand(1..9)}#{("A".."Z").to_a.sample}#{rand(1..9)}"
    project_type = project_types.sample

    permit_project =
      PermitProject.create!(
        owner: submitter_user,
        jurisdiction: current_jurisdiction,
        title: "#{project_type} — #{street_num} #{street}",
        full_address: "#{street_num} #{street}, North Vancouver, BC, #{postal}",
        pid: format("%09d", rand(1..999_999_999)),
        pin: format("PIN%06d", index + 1)
      )

    num_apps = rand(1..4)
    num_apps.times do |app_idx|
      template_version = published_template_versions.sample
      nickname =
        (
          if app_idx == 0
            "Main permit — #{street_num} #{street}"
          else
            "#{project_type} permit ##{app_idx + 1}"
          end
        )
      PermitApplication.create!(
        nickname: nickname,
        submitter: submitter_user,
        permit_project: permit_project,
        activity_id: template_version.activity.id,
        permit_type_id: template_version.permit_type.id,
        template_version: template_version
      )
    end

    # Also create 1-2 draft applications per project
    rand(1..2).times do
      draft_tv = published_template_versions.sample
      PermitApplication.create!(
        submitter: submitter_user,
        permit_project: permit_project,
        activity_id: draft_tv.activity.id,
        permit_type_id: draft_tv.permit_type.id,
        template_version: draft_tv,
        status: :new_draft
      )
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

# ── Showcase project states & permit application statuses ──
puts "Distributing projects across kanban states and setting permit application statuses..."

reviewer_user = User.find_by(omniauth_username: "reviewer")
reason_codes = RevisionReason.pluck(:reason_code)

# Build submission versions & revision requests for a PA, then set its status.
# Rules:
#   new_draft           → 0 submission versions
#   newly_submitted     → 1 submission version
#   revisions_requested → 1+ submission versions, latest has revision request(s)
#   resubmitted         → 2+ submission versions, earlier one has revision request(s)
#   in_review / approved / issued / withdrawn → 1 submission version (progressed from submitted)
seed_pa_status =
  lambda do |pa, target_status|
    target = target_status.to_sym

    if target == :new_draft
      pa.update_column(:status, PermitApplication.statuses[:new_draft])
      return
    end

    base_time = pa.created_at + rand(1..72).hours

    # Every non-draft PA needs at least one submission version
    sv1 =
      pa.submission_versions.create!(
        form_json: pa.template_version&.form_json || {},
        submission_data: {
        },
        created_at: base_time,
        updated_at: base_time
      )

    case target
    when :revisions_requested
      sv1.revision_requests.create!(
        reason_code: reason_codes.sample || "other",
        comment: "Please address the highlighted items.",
        user: reviewer_user
      )
      pa.update_columns(
        status: PermitApplication.statuses[:revisions_requested],
        revisions_requested_at: base_time + 1.day
      )
    when :resubmitted
      sv1.revision_requests.create!(
        reason_code: reason_codes.sample || "other",
        comment: "Initial review comment.",
        user: reviewer_user
      )
      resub_time = base_time + 3.days
      pa.submission_versions.create!(
        form_json: pa.template_version&.form_json || {},
        submission_data: {
        },
        created_at: resub_time,
        updated_at: resub_time
      )
      pa.update_columns(status: PermitApplication.statuses[:resubmitted])
    else
      pa.update_column(:status, PermitApplication.statuses[target])
    end
  end

north_van_projects = PermitProject.where(jurisdiction: north_van).to_a.shuffle

if north_van_projects.size >= 10
  state_distribution = [
    [:queued, [[:newly_submitted], [:new_draft]]],
    [:queued, [[:resubmitted], [:newly_submitted]]],
    [:queued, [[:revisions_requested]]],
    [:queued, [[:newly_submitted]]],
    [:queued, [[:newly_submitted], [:resubmitted]]],
    [:in_progress, [[:in_review], [:in_review], [:newly_submitted]]],
    [:in_progress, [[:revisions_requested], [:in_review], [:approved]]],
    [:in_progress, [[:in_review]]],
    [:in_progress, [[:in_review], [:newly_submitted]]],
    [:ready, [[:approved], [:approved]]],
    [:ready, [[:approved]]],
    [:ready, [[:approved], [:in_review]]],
    [:permit_issued, [[:issued], [:issued]]],
    [:permit_issued, [[:approved], [:issued]]],
    [:permit_issued, [[:issued]]],
    [:active, [[:issued], [:issued], [:issued]]],
    [:active, [[:issued], [:issued]]],
    [:active, [[:issued]]],
    [:complete, [[:issued]]],
    [:complete, [[:issued], [:issued]]],
    [:waiting, [[:in_review], [:newly_submitted]]],
    [:waiting, [[:revisions_requested]]],
    [:waiting, [[:in_review], [:resubmitted]]],
    [:closed, [[:withdrawn]]],
    [:closed, [[:withdrawn], [:issued]]]
  ]

  state_distribution.each_with_index do |(target_state, pa_statuses), idx|
    project = north_van_projects[idx]
    next unless project

    project.update_column(:state, PermitProject.states[target_state])

    kept_apps = project.permit_applications.kept.to_a
    pa_statuses.each_with_index do |pa_status, pa_idx|
      pa = kept_apps[pa_idx]
      next unless pa

      seed_pa_status.call(pa, pa_status.first)
    end
  end

  # Spread enqueued_at across non-draft projects and their non-draft permit applications
  non_draft = north_van_projects.select { |p| p.reload.state != "draft" }
  non_draft.each_with_index do |project, idx|
    enqueued = (idx * 2 + 1).days.ago
    project.update_column(:enqueued_at, enqueued)
    project
      .permit_applications
      .kept
      .where.not(status: :new_draft)
      .update_all(enqueued_at: enqueued)
  end

  puts "  ✓ Distributed #{[state_distribution.size, north_van_projects.size].min} projects across kanban states"
end

PermitApplication.reindex
PermitProject.reindex

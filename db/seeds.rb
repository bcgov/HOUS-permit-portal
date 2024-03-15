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
PermitApplication.reindex

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
EndUserLicenseAgreement.find_or_create_by(
  active: true,
  content:
    "<h1>Non est ista, inquam, Piso, magna dissensio.</h1>

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. An eum discere ea mavis, quae cum plane perdidiceriti nihil sciat? Nulla profecto est, quin suam vim retineat a primo ad extremum. </p>

    <ol>
      <li>Cur igitur, cum de re conveniat, non malumus usitate loqui?</li>
      <li>Polemoni et iam ante Aristoteli ea prima visa sunt, quae paulo ante dixi.</li>
      <li>Nam illud quidem adduci vix possum, ut ea, quae senserit ille, tibi non vera videantur.</li>
    </ol>

    <h2>Quis istud possit, inquit, negare?</h2>

    <p>Duo Reges: constructio interrete. Ea possunt paria non esse. Ergo opifex plus sibi proponet ad formarum quam civis excellens ad factorum pulchritudinem? <b>Aliter enim nosmet ipsos nosse non possumus.</b> Quorum sine causa fieri nihil putandum est. Cum id fugiunt, re eadem defendunt, quae Peripatetici, verba. Quod quidem nobis non saepe contingit. Illo enim addito iuste fit recte factum, per se autem hoc ipsum reddere in officio ponitur. Ita enim se Athenis collocavit, ut sit paene unus ex Atticis, ut id etiam cognomen videatur habiturus. Re mihi non aeque satisfacit, et quidem locis pluribus. </p>

    <ul>
      <li>Sullae consulatum?</li>
      <li>Stulti autem malorum memoria torquentur, sapientes bona praeterita grata recordatione renovata delectant.</li>
      <li>Quem Tiberina descensio festo illo die tanto gaudio affecit, quanto L.</li>
    </ul>

    <dl>
      <dt><dfn>Bork</dfn></dt>
      <dd>Sextilio Rufo, cum is rem ad amicos ita deferret, se esse heredem Q.</dd>
      <dt><dfn>Vide, quaeso, rectumne sit.</dfn></dt>
      <dd>Quae qui non vident, nihil umquam magnum ac cognitione dignum amaverunt.</dd>
      <dt><dfn>Sed videbimus.</dfn></dt>
      <dd>Vadem te ad mortem tyranno dabis pro amico, ut Pythagoreus ille Siculo fecit tyranno?</dd>
      <dt><dfn>Bork</dfn></dt>
      <dd>Mihi, inquam, qui te id ipsum rogavi?</dd>
      <dt><dfn>Immo videri fortasse.</dfn></dt>
      <dd>Honesta oratio, Socratica, Platonis etiam.</dd>
      <dt><dfn>Si longus, levis.</dfn></dt>
      <dd>Idne consensisse de Calatino plurimas gentis arbitramur, primarium populi fuisse, quod praestantissimus fuisset in conficiendis voluptatibus?</dd>
    </dl>

    <p>Atque his de rebus et splendida est eorum et illustris oratio. Cupiditates non Epicuri divisione finiebat, sed sua satietate. Expectoque quid ad id, quod quaerebam, respondeas. In eo autem voluptas omnium Latine loquentium more ponitur, cum percipitur ea, quae sensum aliquem moveat, iucunditas. Istam voluptatem perpetuam quis potest praestare sapienti? Similiter sensus, cum accessit ad naturam, tuetur illam quidem, sed etiam se tuetur; Ipse Epicurus fortasse redderet, ut Sextus Peducaeus, Sex. Habent enim et bene longam et satis litigiosam disputationem. Rationis enim perfectio est virtus; </p>
  ",
)

PermitTypeSubmissionContact.create!(
  jurisdiction_id: north_van.id,
  permit_type_id: rt.permit_type.id,
  email: "example@example.com", # Add a valid email address
)

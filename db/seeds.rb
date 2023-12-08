# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Creating Local Jurisdictions
5.times { FactoryBot.create(:local_jurisdiction) }

# Creating Users with different roles
5.times do
  FactoryBot.create(:user, :submitter).confirm
  FactoryBot.create(:user, :review_manager).confirm
  FactoryBot.create(:user, :reviewer).confirm
  FactoryBot.create(:user, :super_admin).confirm
end

# Creating Permit Applications
local_jurisdictions = LocalJurisdiction.all
submitters = User.where(role: "submitter")

20.times do
  FactoryBot.create(:permit_application, submitter: submitters.sample, local_jurisdiction: local_jurisdictions.sample)
end

# Creating Contacts
local_jurisdictions.each { |lj| rand(3..5).times { FactoryBot.create(:contact, local_jurisdiction: lj) } }

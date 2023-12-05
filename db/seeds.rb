# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

User.where(email: "user@laterolabs.com", username: "user@laterolabs.com").first_or_create!(password: "P@ssword1")
User.where(email: "admin@example.com", username: "admin@example.com").first_or_create!(password: "P@ssword1")

#SEED SPINA ADMIN
Spina::User.where(email: "admin@example.com").first_or_create!(name: "Admin", password: "P@ssword1")

Spina::Resource.where(name: "LocalJurisdictions").first_or_create!(
  name: "LocalJurisdictions",
  label: "Local Jurisdictions",
  view_template: "localjurisdiction",
)
Spina::Resource.where(name: "Articles").first_or_create!(name: "Articles", label: "Articles", view_template: "article")

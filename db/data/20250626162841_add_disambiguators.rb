# frozen_string_literal: true

class AddDisambiguators < ActiveRecord::Migration[7.1]
  def up
    {
      "Nanaimo" => ["City", "Regional District"],
      "North Vancouver" => %w[City District]
    }.each do |name, disambiguators|
      disambiguators.each do |disambiguator|
        # Find jurisdiction by name and a fuzzy match on locality type
        jurisdiction =
          Jurisdiction.find_by(
            "name = ? AND locality_type LIKE ?",
            name,
            "#{disambiguator.downcase}%"
          )
        jurisdiction&.update!(disambiguator: disambiguator)
      end
    end
  end

  def down
    {
      "Nanaimo" => ["City", "Regional District"],
      "North Vancouver" => %w[City District]
    }.each do |name, disambiguators|
      disambiguators.each do |disambiguator|
        jurisdiction =
          Jurisdiction.find_by(
            "name = ? AND locality_type LIKE ?",
            name,
            "#{disambiguator.downcase}%"
          )
        jurisdiction&.update!(disambiguator: nil)
      end
    end
  end
end

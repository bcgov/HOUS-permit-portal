namespace :jurisdiction do
  desc "Cleans up jurisdiction data by normalizing locality types and setting disambiguators for duplicates."
  task cleanup: :environment do
    puts "Starting jurisdiction data cleanup..."
    puts "---"

    ActiveRecord::Base.transaction do
      # Populate disambiguator for jurisdictions with duplicate names and special cases
      # Do NOT modify locality_type; disambiguator excludes the substring "corporation of the"
      puts "Step: Populating disambiguator for duplicate names and special cases (excluding 'corporation of the')..."
      special_cases = ["The Capital"]
      disambiguated_count = 0
      duplicate_names =
        Jurisdiction.group(:name).having("count(name) > 1").pluck(:name)

      # Combine jurisdictions with duplicate names and any named "The Capital"
      jurisdictions_to_disambiguate =
        Jurisdiction
          .where(name: duplicate_names)
          .or(Jurisdiction.where(name: special_cases))
          .order(:name)

      jurisdictions_to_disambiguate.find_each do |jurisdiction|
        cleaned_locality =
          jurisdiction.locality_type.to_s.gsub(/corporation of the/i, "").strip
        next if cleaned_locality.blank?

        if jurisdiction.disambiguator != cleaned_locality
          jurisdiction.update!(disambiguator: cleaned_locality)
          puts "  - Updated Jurisdiction ID: #{jurisdiction.id} ('#{jurisdiction.name}'). Disambiguator set to: '#{cleaned_locality}'."
          disambiguated_count += 1
        end
      end
      puts "Disambiguation complete. #{disambiguated_count} jurisdictions updated."
      puts "---"
    end

    puts "Jurisdiction data cleanup finished."
  end
end

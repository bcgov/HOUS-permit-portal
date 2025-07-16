namespace :jurisdiction do
  desc "Cleans up jurisdiction data by normalizing locality types and setting disambiguators for duplicates."
  task cleanup: :environment do
    puts "Starting jurisdiction data cleanup..."
    puts "---"

    ActiveRecord::Base.transaction do
      # Part 1: Normalize locality_type
      puts "Step 1: Normalizing locality types containing \"corporation of the\"..."
      normalized_count = 0
      jurisdictions_to_normalize =
        Jurisdiction.where("locality_type ILIKE ?", "%corporation of the%")

      jurisdictions_to_normalize.find_each do |jurisdiction|
        old_locality_type = jurisdiction.locality_type
        new_locality_type =
          old_locality_type.gsub(/corporation of the/i, "").strip

        if old_locality_type != new_locality_type
          old_slug = jurisdiction.slug
          jurisdiction.locality_type = new_locality_type
          jurisdiction.slug = nil # Force friendly_id to regenerate the slug on save
          jurisdiction.save!
          new_slug = jurisdiction.slug

          puts "  - Updated Jurisdiction ID: #{jurisdiction.id}. Locality type changed from '#{old_locality_type}' to '#{new_locality_type}'. Slug regenerated from '#{old_slug}' to '#{new_slug}'."
          normalized_count += 1
        end
      end
      puts "Normalization complete. #{normalized_count} jurisdictions updated."
      puts "---"

      # Part 2: Populate disambiguator for jurisdictions with duplicate names and special cases
      puts "Step 2: Populating disambiguator for duplicate names and special cases (e.g., \"The Capital\")..."
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
        if jurisdiction.disambiguator != jurisdiction.locality_type
          jurisdiction.update!(disambiguator: jurisdiction.locality_type)
          puts "  - Updated Jurisdiction ID: #{jurisdiction.id} ('#{jurisdiction.name}'). Disambiguator set to: '#{jurisdiction.locality_type}'."
          disambiguated_count += 1
        end
      end
      puts "Disambiguation complete. #{disambiguated_count} jurisdictions updated."
      puts "---"
    end

    puts "Jurisdiction data cleanup finished."
  end
end

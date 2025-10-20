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

  desc "Populate LTSA matcher using existing jurisdiction names"
  task populate_ltsa_matcher: :environment do
    updates = []
    warnings = []
    errors = []

    Jurisdiction.find_each do |jurisdiction|
      begin
        matcher =
          case jurisdiction.type
          when SubDistrict.name
            jurisdiction.reverse_qualified_name
          when RegionalDistrict.name
            jurisdiction.qualified_name
          else
            nil
          end

        if matcher.present?
          if jurisdiction.ltsa_matcher != matcher
            jurisdiction.update!(ltsa_matcher: matcher)
            updates << "Updated #{jurisdiction.name} with matcher '#{matcher}'"
          end
        else
          warnings << warn_message(
            jurisdiction,
            "Skipped: no matching rule for type #{jurisdiction.type || "unknown"}"
          )
        end
      rescue StandardError => e
        errors << warn_message(
          jurisdiction,
          "Error while assigning matcher: #{e.message}"
        )
      end
    end

    puts "Populate LTSA matcher summary"
    puts "---"
    if updates.any?
      puts "Updated jurisdictions (#{updates.count}):"
      updates.each { |msg| puts "  - #{msg}" }
    else
      puts "No jurisdictions updated."
    end

    if warnings.any?
      puts "Warnings (#{warnings.count}):"
      warnings.each { |msg| puts "  - #{msg}" }
    end

    if errors.any?
      puts "Errors (#{errors.count}):"
      errors.each { |msg| puts "  - #{msg}" }
    end
  end

  def warn_message(jurisdiction, message)
    prefix = jurisdiction.inbox_enabled? ? "⚠️ [INBOX ENABLED] ->" : "->"
    "#{prefix} #{jurisdiction.name}: #{message}"
  end
end

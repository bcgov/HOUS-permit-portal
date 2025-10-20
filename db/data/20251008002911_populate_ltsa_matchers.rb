# frozen_string_literal: true

class PopulateLtsaMatchers < ActiveRecord::Migration[7.2]
  def up
    updates = []
    warnings = []
    errors = []

    say_with_time "Populating LTSA matchers" do
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

      updates.count
    end

    say "Populate LTSA matcher summary"
    say "---"
    if updates.any?
      say "Updated jurisdictions (#{updates.count}):"
      updates.each { |msg| say "  - #{msg}" }
    else
      say "No jurisdictions updated."
    end

    if warnings.any?
      say "Warnings (#{warnings.count}):"
      warnings.each { |msg| say "  - #{msg}" }
    end

    if errors.any?
      say "Errors (#{errors.count}):"
      errors.each { |msg| say "  - #{msg}" }
    end

    Jurisdiction.reindex
    Jurisdiction.search_index.refresh
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def warn_message(jurisdiction, message)
    prefix = jurisdiction.inbox_enabled? ? "[INBOX ENABLED] ->" : "->"
    "#{prefix} #{jurisdiction.name}: #{message}"
  end
end

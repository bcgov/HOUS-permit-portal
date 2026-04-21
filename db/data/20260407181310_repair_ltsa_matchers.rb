# frozen_string_literal: true

class RepairLtsaMatchers < ActiveRecord::Migration[7.2]
  def up
    ltsa = Wrappers::LtsaParcelMapBc.new

    say_with_time "Fetching LTSA vocabulary" do
      @municipalities = ltsa.distinct_municipalities
      @regional_districts = ltsa.distinct_regional_districts
      say "  #{@municipalities.size} MUNICIPALITY values, #{@regional_districts.size} REGIONAL_DISTRICT values"
    end

    updated = 0
    skipped = 0
    failed = 0

    muni_entries = @municipalities.reject { |m| m == "Rural" }

    say_with_time "Repairing SubDistrict matchers (from MUNICIPALITY)" do
      muni_entries.each do |muni_value|
        derived =
          Jurisdiction.ltsa_matcher_from_ltsa_attributes(
            "MUNICIPALITY" => muni_value,
            "REGIONAL_DISTRICT" => "N/A"
          )

        jurisdiction =
          find_jurisdiction_for_ltsa_value(derived, "SubDistrict", muni_value)
        next(skipped += 1) unless jurisdiction

        if jurisdiction.ltsa_matcher == derived
          skipped += 1
          next
        end

        old = jurisdiction.ltsa_matcher
        begin
          jurisdiction.update_columns(ltsa_matcher: derived)
          say "  Updated #{jurisdiction.qualified_name}: '#{old}' -> '#{derived}'"
          updated += 1
        rescue => e
          say "  FAILED #{jurisdiction.qualified_name}: #{e.message}"
          failed += 1
        end
      end
    end

    say_with_time "Repairing RegionalDistrict matchers (from REGIONAL_DISTRICT)" do
      @regional_districts.each do |rd_value|
        derived =
          Jurisdiction.ltsa_matcher_from_ltsa_attributes(
            "MUNICIPALITY" => "Rural",
            "REGIONAL_DISTRICT" => rd_value
          )

        jurisdiction =
          find_jurisdiction_for_ltsa_value(
            derived,
            "RegionalDistrict",
            rd_value
          )
        next(skipped += 1) unless jurisdiction

        if jurisdiction.ltsa_matcher == derived
          skipped += 1
          next
        end

        old = jurisdiction.ltsa_matcher
        begin
          jurisdiction.update_columns(ltsa_matcher: derived)
          say "  Updated #{jurisdiction.qualified_name}: '#{old}' -> '#{derived}'"
          updated += 1
        rescue => e
          say "  FAILED #{jurisdiction.qualified_name}: #{e.message}"
          failed += 1
        end
      end
    end

    say "RepairLtsaMatchers: #{updated} updated, #{skipped} skipped, #{failed} failed"

    if updated > 0
      say_with_time "Reindexing Jurisdiction in Searchkick" do
        Jurisdiction.reindex
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  # Try to find the jurisdiction that should own this LTSA value.
  # Strategy:
  #   1. Exact match on ltsa_matcher (already correct, will be skipped)
  #   2. Searchkick fuzzy match (same path as production)
  #   3. Name-based fallback for known patterns
  def find_jurisdiction_for_ltsa_value(
    derived_matcher,
    expected_type,
    ltsa_value
  )
    exact =
      Jurisdiction.find_by(ltsa_matcher: derived_matcher, type: expected_type)
    return exact if exact

    attrs =
      if expected_type == "RegionalDistrict"
        { "MUNICIPALITY" => "Rural", "REGIONAL_DISTRICT" => ltsa_value }
      else
        { "MUNICIPALITY" => ltsa_value, "REGIONAL_DISTRICT" => "N/A" }
      end

    begin
      fuzzy = Jurisdiction.fuzzy_find_by_ltsa_feature_attributes(attrs)
      return fuzzy if fuzzy&.type == expected_type
    rescue StandardError
      nil
    end

    core_name = extract_core_name(ltsa_value)
    if core_name.present?
      Jurisdiction
        .where(type: expected_type)
        .where("LOWER(name) = ?", core_name.downcase)
        .first
    end
  end

  def extract_core_name(ltsa_value)
    if ltsa_value.include?(",")
      ltsa_value.split(",", 2).first.strip
    elsif ltsa_value =~ /\ARegional District of (.+)\z/i
      Regexp.last_match(1).strip
    elsif ltsa_value =~ /\A(.+?) Regional (?:District|Municipality)\z/i
      Regexp.last_match(1).strip
    else
      ltsa_value
    end
  end
end

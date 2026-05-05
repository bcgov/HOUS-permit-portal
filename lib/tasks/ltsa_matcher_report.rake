# frozen_string_literal: true

require "csv"

# Validates ltsa_matcher values against the authoritative LTSA parcel fabric.
#
# Approach (non-circular):
#   1. Pull every distinct MUNICIPALITY and REGIONAL_DISTRICT string from the
#      LTSA parcel fabric via returnDistinctValues (two API calls, no PIDs).
#   2. For each LTSA entry, build the same synthetic attributes hash that
#      production receives, then call fuzzy_find_by_ltsa_feature_attributes.
#   3. Check whether Searchkick resolves to a jurisdiction and whether that
#      jurisdiction's ltsa_matcher matches the LTSA string.
#   4. Separately flag jurisdictions whose ltsa_matcher is blank or has no
#      corresponding entry in the LTSA vocabulary (orphans).
module LtsaMatcherReport
  CSV_HEADERS = [
    "ltsa_source",
    "ltsa_value",
    "expected_type",
    "status",
    "matched_jurisdiction_id",
    "matched_jurisdiction_name",
    "matched_ltsa_matcher",
    "matcher_matches_ltsa",
    "suggested_fix"
  ].freeze

  ORPHAN_CSV_HEADERS = [
    "jurisdiction_id",
    "jurisdiction_type",
    "jurisdiction_name",
    "qualified_name",
    "ltsa_matcher",
    "orphan_reason",
    "suggested_fix"
  ].freeze

  module_function

  def run(verbose: false)
    verify_searchkick!

    puts "Fetching distinct MUNICIPALITY values from LTSA parcel fabric..."
    ltsa = Wrappers::LtsaParcelMapBc.new
    municipalities = ltsa.distinct_municipalities
    regional_districts = ltsa.distinct_regional_districts
    puts "  #{municipalities.size} distinct MUNICIPALITY values"
    puts "  #{regional_districts.size} distinct REGIONAL_DISTRICT values"
    puts

    rows = []

    puts "Testing MUNICIPALITY entries against Searchkick..."
    muni_entries = municipalities.reject { |m| m == "Rural" }
    muni_entries.each_with_index do |muni, idx|
      puts "  [#{idx + 1}/#{muni_entries.size}] #{muni}" if verbose
      rows << test_entry(
        ltsa_source: "MUNICIPALITY",
        ltsa_value: muni,
        attributes: { "MUNICIPALITY" => muni, "REGIONAL_DISTRICT" => "N/A" },
        expected_type: "SubDistrict"
      )
    end

    puts "Testing REGIONAL_DISTRICT entries against Searchkick..."
    regional_districts.each_with_index do |rd, idx|
      puts "  [#{idx + 1}/#{regional_districts.size}] #{rd}" if verbose
      rows << test_entry(
        ltsa_source: "REGIONAL_DISTRICT",
        ltsa_value: rd,
        attributes: { "MUNICIPALITY" => "Rural", "REGIONAL_DISTRICT" => rd },
        expected_type: "RegionalDistrict"
      )
    end
    puts

    ltsa_vocabulary = build_ltsa_vocabulary(municipalities, regional_districts)
    orphans = find_orphaned_jurisdictions(ltsa_vocabulary)

    print_summary(rows, orphans)
    print_details(rows, verbose: verbose)
    print_orphans(orphans)

    csv_path = export_csv(rows, orphans)
    puts "CSV exported to: #{csv_path}"
  end

  # -------------------------------------------------------------------------
  # Analysis
  # -------------------------------------------------------------------------

  def verify_searchkick!
    Jurisdiction.searchkick_index
    SubDistrict.search("*", limit: 1)
  rescue StandardError => e
    warn <<~MSG

      Searchkick/Elasticsearch is required for this report (#{e.class}: #{e.message}).
      Start Elasticsearch, run `rails searchkick:reindex:all` (or `Jurisdiction.reindex`), then retry.
    MSG
    exit 1
  end

  def test_entry(ltsa_source:, ltsa_value:, attributes:, expected_type:)
    row = {
      ltsa_source: ltsa_source,
      ltsa_value: ltsa_value,
      expected_type: expected_type,
      status: nil,
      matched_id: nil,
      matched_name: nil,
      matched_ltsa_matcher: nil,
      matcher_matches_ltsa: nil
    }

    begin
      resolved = Jurisdiction.fuzzy_find_by_ltsa_feature_attributes(attributes)
    rescue => e
      row[:status] = :search_error
      row[:error] = "#{e.class}: #{e.message}"
      return row
    end

    derived_matcher = Jurisdiction.ltsa_matcher_from_ltsa_attributes(attributes)

    if resolved.nil?
      row[:status] = :no_match
    else
      row[:matched_id] = resolved.id
      row[:matched_name] = resolved.qualified_name
      row[:matched_ltsa_matcher] = resolved.ltsa_matcher

      matches = resolved.ltsa_matcher.present? &&
        derived_matcher.present? &&
        resolved.ltsa_matcher.strip.downcase == derived_matcher.strip.downcase
      row[:matcher_matches_ltsa] = matches

      if resolved.type == expected_type
        row[:status] = matches ? :ok : :ok_but_matcher_differs
      else
        row[:status] = :wrong_type
      end
    end

    row
  end

  def build_ltsa_vocabulary(municipalities, regional_districts)
    vocab = Set.new
    municipalities.each { |m| vocab << m.strip.downcase unless m == "Rural" }
    regional_districts.each { |rd| vocab << rd.strip.downcase }
    vocab
  end

  def find_orphaned_jurisdictions(ltsa_vocabulary)
    orphans = []

    Jurisdiction.find_each do |j|
      if j.ltsa_matcher.blank?
        orphans << {
          id: j.id,
          type: j.type,
          name: j.name,
          qualified_name: j.qualified_name,
          ltsa_matcher: j.ltsa_matcher,
          reason: :blank_matcher
        }
      elsif !ltsa_vocabulary.include?(j.ltsa_matcher.strip.downcase)
        orphans << {
          id: j.id,
          type: j.type,
          name: j.name,
          qualified_name: j.qualified_name,
          ltsa_matcher: j.ltsa_matcher,
          reason: :not_in_ltsa_vocabulary
        }
      end
    end

    orphans
  end

  # -------------------------------------------------------------------------
  # Console output
  # -------------------------------------------------------------------------

  def print_summary(rows, orphans)
    by_status = rows.group_by { |r| r[:status] }
    by_source = rows.group_by { |r| r[:ltsa_source] }
    orphan_reasons = orphans.group_by { |o| o[:reason] }

    puts
    puts "LTSA Matcher Report (authoritative vocabulary)"
    puts "=" * 70

    puts
    puts "LTSA vocabulary:"
    puts "  MUNICIPALITY entries tested:       #{by_source["MUNICIPALITY"]&.size || 0}"
    puts "  REGIONAL_DISTRICT entries tested:  #{by_source["REGIONAL_DISTRICT"]&.size || 0}"
    puts "  Total LTSA entries:                #{rows.size}"

    puts
    puts "Resolution results:"
    puts "  OK (correct type, matcher matches):           #{by_status[:ok]&.size || 0}"
    puts "  OK but matcher text differs (still resolves): #{by_status[:ok_but_matcher_differs]&.size || 0}"
    puts "  Wrong type (e.g. RD resolved as SubDistrict): #{by_status[:wrong_type]&.size || 0}"
    puts "  No match (Searchkick returned nil):           #{by_status[:no_match]&.size || 0}"
    puts "  Search error:                                 #{by_status[:search_error]&.size || 0}"

    puts
    puts "Jurisdiction orphans (DB entries without LTSA coverage):"
    puts "  Blank ltsa_matcher:           #{orphan_reasons[:blank_matcher]&.size || 0}"
    puts "  Matcher not in LTSA vocab:    #{orphan_reasons[:not_in_ltsa_vocabulary]&.size || 0}"
    puts "  Total orphans:                #{orphans.size}"
    puts
  end

  def print_details(rows, verbose:)
    broken = rows.reject { |r| r[:status] == :ok }

    puts "LTSA entries needing attention: #{broken.size}"
    puts "(Set VERBOSE=1 to include OK rows.)" unless verbose
    puts

    to_print = verbose ? rows : broken
    to_print
      .sort_by { |r| [status_sort_key(r[:status]), r[:ltsa_value].to_s] }
      .each do |r|
        puts format_row(r)
        puts
      end
  end

  def print_orphans(orphans)
    return if orphans.empty?

    puts "Orphaned jurisdictions: #{orphans.size}"
    puts

    orphans
      .sort_by { |o| [o[:reason].to_s, o[:qualified_name].to_s] }
      .each do |o|
        puts format_orphan(o)
        puts
      end
  end

  def status_sort_key(status)
    { wrong_type: 0, no_match: 1, ok_but_matcher_differs: 2,
      search_error: 3, ok: 4 }.fetch(status, 99)
  end

  def format_row(r)
    lines = []
    lines << "[#{r[:status]}] #{r[:ltsa_source]}=#{r[:ltsa_value].inspect} (expects #{r[:expected_type]})"

    if r[:matched_id]
      lines << "  resolved to: id=#{r[:matched_id]} #{r[:matched_name].inspect}"
      lines << "  jurisdiction ltsa_matcher: #{r[:matched_ltsa_matcher].inspect}"
      lines << "  matcher matches LTSA: #{r[:matcher_matches_ltsa] ? "YES" : "NO"}"
    end

    lines << "  error: #{r[:error]}" if r[:error]
    lines << "  suggested fix: #{suggested_fix(r)}"
    lines.join("\n")
  end

  def format_orphan(o)
    lines = []
    lines << "[#{o[:reason]}] id=#{o[:id]} #{o[:type]} — #{o[:qualified_name]}"
    lines << "  ltsa_matcher: #{o[:ltsa_matcher].inspect}"
    lines << "  suggested fix: #{orphan_fix(o)}"
    lines.join("\n")
  end

  def suggested_fix(r)
    case r[:status]
    when :ok
      "None needed."
    when :ok_but_matcher_differs
      "Searchkick resolves correctly via fuzzy match, but ltsa_matcher #{r[:matched_ltsa_matcher].inspect} " \
        "differs from LTSA string #{r[:ltsa_value].inspect}. Consider updating ltsa_matcher to the exact LTSA string, then reindex."
    when :wrong_type
      "Resolved to #{r[:matched_name].inspect} (id=#{r[:matched_id]}) which is the wrong type. " \
        "Expected #{r[:expected_type]} but got a different STI class. Check for naming collisions between municipalities and regional districts."
    when :no_match
      "No jurisdiction matched LTSA string #{r[:ltsa_value].inspect}. " \
        "Either create this jurisdiction or set an existing jurisdiction's ltsa_matcher to this value, then reindex."
    when :search_error
      "Searchkick query failed: #{r[:error]}. Check Elasticsearch health and reindex."
    else
      "Unknown status."
    end
  end

  def orphan_fix(o)
    case o[:reason]
    when :blank_matcher
      "Set ltsa_matcher to the MUNICIPALITY or REGIONAL_DISTRICT string LTSA uses for this area, then Jurisdiction.reindex."
    when :not_in_ltsa_vocabulary
      "The stored ltsa_matcher #{o[:ltsa_matcher].inspect} does not appear in the LTSA parcel fabric. " \
        "It may be misspelled, outdated, or this jurisdiction has no parcels in LTSA. Verify against the LTSA service and update if needed."
    else
      "Unknown reason."
    end
  end

  # -------------------------------------------------------------------------
  # CSV export
  # -------------------------------------------------------------------------

  def export_csv(rows, orphans)
    timestamp = Time.current.strftime("%Y%m%d_%H%M%S")
    path = Rails.root.join("tmp", "ltsa_matcher_report_#{timestamp}.csv")
    FileUtils.mkdir_p(File.dirname(path))

    CSV.open(path, "w") do |csv|
      csv << ["=== LTSA VOCABULARY RESOLUTION ==="]
      csv << CSV_HEADERS

      rows
        .sort_by { |r| [status_sort_key(r[:status]), r[:ltsa_value].to_s] }
        .each do |r|
          csv << [
            r[:ltsa_source],
            r[:ltsa_value],
            r[:expected_type],
            r[:status],
            r[:matched_id],
            r[:matched_name],
            r[:matched_ltsa_matcher],
            r[:matcher_matches_ltsa].nil? ? nil : (r[:matcher_matches_ltsa] ? "YES" : "NO"),
            suggested_fix(r)
          ]
        end

      csv << []
      csv << ["=== ORPHANED JURISDICTIONS ==="]
      csv << ORPHAN_CSV_HEADERS

      orphans
        .sort_by { |o| [o[:reason].to_s, o[:qualified_name].to_s] }
        .each do |o|
          csv << [
            o[:id],
            o[:type],
            o[:name],
            o[:qualified_name],
            o[:ltsa_matcher],
            o[:reason],
            orphan_fix(o)
          ]
        end
    end

    path.to_s
  end
end

namespace :jurisdiction do
  desc "Validate ltsa_matcher against authoritative LTSA vocabulary (distinct MUNICIPALITY/REGIONAL_DISTRICT). Needs Elasticsearch + LTSA API. Exports CSV to tmp/."
  task ltsa_matcher_report: :environment do
    verbose = ENV["VERBOSE"].present? && ENV["VERBOSE"] != "0"
    LtsaMatcherReport.run(verbose: verbose)
  end
end

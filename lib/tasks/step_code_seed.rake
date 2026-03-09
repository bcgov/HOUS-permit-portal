require "csv"

# Configurable Part 3 occupancies for template generation and import validation.
# Non-configurable occupancies (Schools, Libraries, Colleges, Recreation centres,
# Hospitals, Care centres) use the provincial baseline (Energy Step 2) and are
# not included — they cannot be overridden per jurisdiction.
module StepCodeSeed
  PART3_OCCUPANCIES = [
    {
      key: "hotels_and_motels",
      name: "Hotels and motels",
      group: "C",
      division: nil,
      allowed_energy: [2, 3, 4],
      allowed_zc: [1, 2, 3, 4],
      baseline_energy: 2,
      baseline_zc: 1
    },
    {
      key: "other_residential_occupancies",
      name: "Other residential occupancies",
      group: "C",
      division: nil,
      allowed_energy: [2, 3, 4],
      allowed_zc: [1, 2, 3, 4],
      baseline_energy: 2,
      baseline_zc: 1
    },
    {
      key: "offices",
      name: "Offices",
      group: "D",
      division: nil,
      allowed_energy: [2, 3],
      allowed_zc: [1, 2, 3, 4],
      baseline_energy: 2,
      baseline_zc: 1
    },
    {
      key: "other_personal_services",
      name: "Other personal services",
      group: "D",
      division: nil,
      allowed_energy: [2, 3],
      allowed_zc: [1, 2, 3, 4],
      baseline_energy: 2,
      baseline_zc: 1
    },
    {
      key: "mercantile_occupancies",
      name: "Mercantile occupancies",
      group: "E",
      division: nil,
      allowed_energy: [2, 3],
      allowed_zc: [1, 2, 3, 4],
      baseline_energy: 2,
      baseline_zc: 1
    }
  ].freeze

  VALID_CLIMATE_ZONES = %w[
    zone_4
    zone_5
    zone_6
    zone_7a
    zone_7b
    zone_8
  ].freeze

  CLIMATE_ZONE_LABELS = {
    "zone_4" => "Zone 4",
    "zone_5" => "Zone 5",
    "zone_6" => "Zone 6",
    "zone_7a" => "Zone 7A",
    "zone_7b" => "Zone 7B",
    "zone_8" => "Zone 8"
  }.freeze

  PART9_PERMIT_TYPE_CODE = "low_residential".freeze

  module_function

  # --- Template Generation (static — no DB required) ---

  def generate_step_requirements_csv(path)
    part9_note =
      "Energy step: 3-5. Zero carbon: 1-4. Duplicate row for multiple pathways."

    CSV.open(path, "wb") do |csv|
      csv << [
        "Section",
        "Key",
        "Name",
        "Energy Step Required",
        "Zero Carbon Step Required",
        "Notes (do not edit this column)"
      ]

      # --- Part 9 (single permit type: low_residential) ---
      csv << [
        "Part 9",
        PART9_PERMIT_TYPE_CODE,
        "Small-scale/Multi-unit housing (Part 9 BCBC)",
        "",
        "",
        part9_note
      ]

      csv << []

      # Non-configurable occupancies (Schools, Libraries, Colleges, Recreation
      # centres, Hospitals, Care centres) are omitted — they use the provincial
      # baseline (Energy Step 2) and cannot be overridden per jurisdiction.

      # --- Part 3 configurable ---
      PART3_OCCUPANCIES.each do |occ|
        group_label = group_label_for(occ)
        energy_range =
          "#{occ[:allowed_energy].min}-#{occ[:allowed_energy].max}"
        zc_range = "#{occ[:allowed_zc].min}-#{occ[:allowed_zc].max}"
        note =
          "Energy: #{energy_range}. Zero carbon: #{zc_range}. Duplicate row for multiple pathways."

        csv << [
          "Part 3",
          occ[:key],
          "#{occ[:name]} (#{group_label})",
          "",
          "",
          note
        ]
      end
    end
  end

  def generate_climate_zones_csv(path)
    CSV.open(path, "wb") do |csv|
      csv << [
        "Climate Zone",
        "Heating Degree Days (optional)",
        "Zone Label (reference - do not edit)"
      ]

      VALID_CLIMATE_ZONES.each do |zone|
        csv << [zone, "", CLIMATE_ZONE_LABELS[zone]]
      end
    end
  end

  def group_label_for(occ)
    label = "Group #{occ[:group]}"
    label += " Div #{occ[:division]}" if occ[:division]
    label
  end

  # --- Import Logic ---

  def import_step_requirements_from_dir(input_dir)
    files = Dir.glob(File.join(input_dir, "*-step-requirements.csv")).sort

    if files.empty?
      puts "No step requirements CSV files found in #{input_dir}"
      return
    end

    puts "\n=== Importing Step Requirements ==="
    totals = {
      part9_updated: 0,
      part9_skipped: 0,
      part3_created: 0,
      part3_skipped: 0,
      errors: 0
    }

    files.each do |file|
      slug = File.basename(file).sub("-step-requirements.csv", "")
      jurisdiction = Jurisdiction.find_by(slug: slug)

      unless jurisdiction
        puts "  SKIP: No jurisdiction for slug '#{slug}'"
        totals[:errors] += 1
        next
      end

      puts "  Processing: #{slug}..."
      stats = import_step_requirements_file(file, jurisdiction)
      totals.merge!(stats) { |_k, a, b| a + b }
    end

    puts "\nStep Requirements Import Summary:"
    puts "  Part 9 updated:      #{totals[:part9_updated]}"
    puts "  Part 9 skipped:      #{totals[:part9_skipped]}"
    puts "  Part 3 created:      #{totals[:part3_created]}"
    puts "  Part 3 skipped:      #{totals[:part3_skipped]}"
    puts "  Errors:              #{totals[:errors]}"
  end

  def import_step_requirements_file(file, jurisdiction)
    stats = {
      part9_updated: 0,
      part9_skipped: 0,
      part3_created: 0,
      part3_skipped: 0,
      errors: 0
    }

    # Clear existing customizations so we can re-create from CSV.
    # Default Part 9 records are kept and updated in place.
    jurisdiction.permit_type_required_steps.customizations.destroy_all
    jurisdiction.part3_occupancy_required_steps.destroy_all

    # Track which Part 9 permit types have already had their default updated,
    # so subsequent rows for the same permit type become customizations.
    part9_default_updated = Set.new

    CSV.foreach(file, headers: true, skip_blanks: true) do |row|
      section = row["Section"]&.strip
      next if section.blank?

      key = row["Key"]&.strip
      energy_str = row["Energy Step Required"]&.strip
      zc_str = row["Zero Carbon Step Required"]&.strip

      case section
      when "Part 9"
        unless energy_str.present? && zc_str.present?
          stats[:part9_skipped] += 1
          next
        end

        permit_type = PermitType.find_by(code: PART9_PERMIT_TYPE_CODE)
        unless permit_type
          puts "    WARN: PermitType '#{PART9_PERMIT_TYPE_CODE}' not found"
          stats[:errors] += 1
          next
        end

        if part9_default_updated.include?(permit_type.id)
          # Additional row for same permit type → create a customization
          record =
            jurisdiction.permit_type_required_steps.build(
              permit_type: permit_type,
              energy_step_required: energy_str.to_i,
              zero_carbon_step_required: zc_str.to_i
            )

          if record.save
            stats[:part9_updated] += 1
          else
            puts "    WARN: Failed to save Part 9 customization '#{key}': #{record.errors.full_messages.join(", ")}"
            stats[:errors] += 1
          end
        else
          # First row for this permit type → update the default record
          record =
            jurisdiction.permit_type_required_steps.find_by(
              permit_type: permit_type,
              default: true
            )
          if record
            record.update!(
              energy_step_required: energy_str.to_i,
              zero_carbon_step_required: zc_str.to_i
            )
            stats[:part9_updated] += 1
          else
            stats[:part9_skipped] += 1
          end
          part9_default_updated.add(permit_type.id)
        end
      when "Part 3"
        unless energy_str.present?
          stats[:part3_skipped] += 1
          next
        end

        unless Part3OccupancyRequiredStep::CONFIGURABLE_OCCUPANCY_KEYS.include?(
                 key
               )
          stats[:part3_skipped] += 1
          next
        end

        record =
          jurisdiction.part3_occupancy_required_steps.build(
            occupancy_key: key,
            energy_step_required: energy_str.to_i,
            zero_carbon_step_required: zc_str.present? ? zc_str.to_i : nil
          )

        if record.save
          stats[:part3_created] += 1
        else
          puts "    WARN: Failed to save Part 3 '#{key}': #{record.errors.full_messages.join(", ")}"
          stats[:errors] += 1
        end
      else
        stats[:part3_skipped] += 1
      end
    end

    stats
  end

  def import_climate_zones_from_dir(input_dir)
    files = Dir.glob(File.join(input_dir, "*-climate-zones.csv")).sort

    if files.empty?
      puts "No climate zones CSV files found in #{input_dir}"
      return
    end

    puts "\n=== Importing Climate Zones ==="
    total_created = 0
    total_skipped = 0
    total_errors = 0

    files.each do |file|
      slug = File.basename(file).sub("-climate-zones.csv", "")
      jurisdiction = Jurisdiction.find_by(slug: slug)

      unless jurisdiction
        puts "  SKIP: No jurisdiction for slug '#{slug}'"
        total_errors += 1
        next
      end

      puts "  Processing: #{slug}..."
      jurisdiction.jurisdiction_climate_zones.destroy_all

      CSV.foreach(file, headers: true, skip_blanks: true) do |row|
        zone = row["Climate Zone"]&.strip
        hdd_str = row["Heating Degree Days (optional)"]&.strip
        next if zone.blank?

        unless VALID_CLIMATE_ZONES.include?(zone)
          puts "    WARN: Invalid climate zone '#{zone}'"
          total_errors += 1
          next
        end

        record =
          jurisdiction.jurisdiction_climate_zones.build(
            climate_zone: zone,
            heating_degree_days: hdd_str.present? ? hdd_str.to_i : nil
          )

        if record.save
          total_created += 1
        else
          puts "    WARN: Failed to save '#{zone}': #{record.errors.full_messages.join(", ")}"
          total_errors += 1
        end
      end
    end

    puts "\nClimate Zones Import Summary:"
    puts "  Created: #{total_created}"
    puts "  Skipped: #{total_skipped}"
    puts "  Errors:  #{total_errors}"
  end
end

namespace :step_code_seed do
  desc "Generate blank CSV templates for step code requirements and climate zones"
  task generate_templates: [] do
    output_dir = Rails.root.join("data", "step_code_seed")
    FileUtils.mkdir_p(output_dir)

    req_path = output_dir.join("example-step-requirements.csv")
    cz_path = output_dir.join("example-climate-zones.csv")

    StepCodeSeed.generate_step_requirements_csv(req_path)
    StepCodeSeed.generate_climate_zones_csv(cz_path)

    puts "Generated template files in #{output_dir}:"
    puts "  example-step-requirements.csv"
    puts "  example-climate-zones.csv"
    puts "\nRecipients should rename these using their jurisdiction slug, e.g.:"
    puts "  city-of-mission-step-requirements.csv"
    puts "  city-of-mission-climate-zones.csv"
  end

  desc "Import step code requirements and climate zones from CSV files in data/step_code_seed/"
  task import: :environment do
    input_dir = Rails.root.join("data", "step_code_seed")

    unless Dir.exist?(input_dir)
      puts "Error: Directory not found at #{input_dir}"
      puts "Run 'rake step_code_seed:generate_templates' first."
      exit 1
    end

    StepCodeSeed.import_step_requirements_from_dir(input_dir)
    StepCodeSeed.import_climate_zones_from_dir(input_dir)
  end

  desc "Import step code requirements only from data/step_code_seed/"
  task import_step_requirements: :environment do
    input_dir = Rails.root.join("data", "step_code_seed")
    StepCodeSeed.import_step_requirements_from_dir(input_dir)
  end

  desc "Import climate zones only from data/step_code_seed/"
  task import_climate_zones: :environment do
    input_dir = Rails.root.join("data", "step_code_seed")
    StepCodeSeed.import_climate_zones_from_dir(input_dir)
  end
end

# frozen_string_literal: true

namespace :heating_degree_days do
  desc "Replace heating degree days from BCBC 2024 Table C-2. DRY_RUN=1 previews."
  task import_bcbc: :environment do
    dry_run = ENV["DRY_RUN"].present?

    grouped =
      BcbcHeatingDegreeDays.import_rows.group_by do |row|
        [row[:name], row[:locality_type]]
      end

    missing = []
    plans = []

    grouped.each do |(name, locality_type), rows|
      jurisdiction = Jurisdiction.find_by(name: name, locality_type: locality_type)
      if jurisdiction
        plans << [jurisdiction, rows]
      else
        missing << [name, locality_type]
      end
    end

    writing = !dry_run

    plans.each do |jurisdiction, rows|
      puts jurisdiction.qualified_name
      jurisdiction.jurisdiction_heating_degree_days.each do |record|
        puts "  #{writing ? "remove" : "would remove"} #{record.location_name} = #{record.heating_degree_days}"
      end
      rows.each do |row|
        puts "  #{writing ? "set" : "would set"} #{row[:location_name]} = #{row[:heating_degree_days]}"
      end
    end

    puts "\nLeft unchanged (no Table C-2 station):"
    Jurisdiction
      .all
      .sort_by(&:qualified_name)
      .each do |jurisdiction|
        next if grouped.key?([jurisdiction.name, jurisdiction.locality_type])

        puts "  #{jurisdiction.qualified_name}"
      end

    puts "\nJurisdictions: #{plans.size}"
    puts "Missing jurisdictions: #{missing.size}"
    missing.each { |name, locality_type| puts "  #{name} (#{locality_type})" }

    next unless writing

    ActiveRecord::Base.transaction do
      plans.each do |jurisdiction, rows|
        jurisdiction.jurisdiction_heating_degree_days.destroy_all
        rows.each do |row|
          jurisdiction.jurisdiction_heating_degree_days.create!(
            location_name: row[:location_name],
            heating_degree_days: row[:heating_degree_days]
          )
        end
      end
    end
  end
end
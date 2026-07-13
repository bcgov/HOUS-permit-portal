# frozen_string_literal: true

namespace :jurisdiction do
  desc "Upsert Part 9 JurisdictionStepRequirement pathways from data/jurisdiction_step_requirements_seed.rb"
  task seed_step_requirements: :environment do
    seed_path = Rails.root.join("data", "jurisdiction_step_requirements_seed.rb")
    load seed_path

    created = 0
    updated = 0
    unchanged = 0
    skipped = 0
    removed = 0
    errors = 0
    empty_pathways = 0

    JURISDICTION_STEP_REQUIREMENTS_SEED.each do |row|
      name = row.fetch(:name)
      locality_type = row.fetch(:locality_type)
      pathways = Array(row[:pathways])

      jurisdiction = Jurisdiction.find_by(name: name, locality_type: locality_type)
      unless jurisdiction
        puts "SKIP: no jurisdiction for name=#{name.inspect} locality_type=#{locality_type.inspect}"
        skipped += 1
        next
      end

      if pathways.empty?
        empty_pathways += 1
        next
      end

      desired_pairs =
        pathways
          .map { |p| [p.fetch(:energy_step_required).to_i, p.fetch(:zero_carbon_step_required).to_i] }
          .uniq

      existing = jurisdiction.jurisdiction_step_requirements.customizations.to_a
      matched_ids = []

      desired_pairs.each do |energy, zero_carbon|
        requirement =
          existing.find do |r|
            !matched_ids.include?(r.id) && r.energy_step_required == energy &&
              r.zero_carbon_step_required == zero_carbon
          end

        if requirement
          matched_ids << requirement.id
          unchanged += 1
          next
        end

        requirement =
          existing.find { |r| !matched_ids.include?(r.id) } ||
            jurisdiction.jurisdiction_step_requirements.build(default: nil)

        was_new = requirement.new_record?
        requirement.energy_step_required = energy
        requirement.zero_carbon_step_required = zero_carbon

        if requirement.save
          matched_ids << requirement.id
          if was_new
            created += 1
            puts "CREATED: #{jurisdiction.qualified_name} energy=#{energy} zc=#{zero_carbon}"
          else
            updated += 1
            puts "UPDATED: #{jurisdiction.qualified_name} energy=#{energy} zc=#{zero_carbon}"
          end
        else
          errors += 1
          puts "ERROR #{jurisdiction.qualified_name} energy=#{energy} zc=#{zero_carbon}: #{requirement.errors.full_messages.join(", ")}"
        end
      end

      existing.each do |r|
        next if matched_ids.include?(r.id)

        r.destroy!
        removed += 1
        puts "REMOVED: #{jurisdiction.qualified_name} energy=#{r.energy_step_required} zc=#{r.zero_carbon_step_required}"
      end
    end

    puts "\nDone. created=#{created} updated=#{updated} unchanged=#{unchanged} removed=#{removed} skipped=#{skipped} empty_pathways=#{empty_pathways} errors=#{errors}"
  end
end

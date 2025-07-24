class PermitTypeRequiredStepSeeder
  def self.seed
    low_residential_permit_type = PermitType.find_by(code: "low_residential")
    return unless low_residential_permit_type

    Jurisdiction.find_each do |jurisdiction|
      PermitTypeRequiredStep.find_or_create_by!(
        jurisdiction: jurisdiction,
        permit_type: low_residential_permit_type
      ) do |ptr_step|
        ptr_step.default = true
        ptr_step.energy_step_required =
          (
            if jurisdiction.respond_to?(:energy_step_required)
              jurisdiction.energy_step_required || 0
            else
              ENV["PART_9_MIN_ENERGY_STEP"].to_i
            end
          )
        ptr_step.zero_carbon_step_required =
          (
            if jurisdiction.respond_to?(:zero_carbon_step_required)
              jurisdiction.zero_carbon_step_required || 0
            else
              ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i
            end
          )
      end
    end
  end
end

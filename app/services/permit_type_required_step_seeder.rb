class PermitTypeRequiredStepSeeder
  def self.seed
    Jurisdiction.find_each do |jurisdiction|
      PermitType.find_each do |permit_type|
        PermitTypeRequiredStep.find_or_create_by!(
          jurisdiction: jurisdiction,
          permit_type: permit_type
        ) do |ptr_step|
          ptr_step.default = true
          ptr_step.energy_step_required =
            (
              if jurisdiction.respond_to?(:energy_step_required)
                jurisdiction.energy_step_required || 0
              else
                ENV["MIN_ENERGY_STEP"].to_i
              end
            )
          ptr_step.zero_carbon_step_required =
            (
              if jurisdiction.respond_to?(:zero_carbon_step_required)
                jurisdiction.zero_carbon_step_required || 0
              else
                ENV["MIN_ZERO_CARBON_STEP"].to_i
              end
            )
        end
      end
    end
  end
end

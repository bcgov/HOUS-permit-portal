class JurisdictionTemplateRequiredStepSeeder
  def self.seed
    Jurisdiction.find_each do |jurisdiction|
      RequirementTemplate.find_each do |requirement_template|
        JurisdictionTemplateRequiredStep.find_or_create_by!(
          jurisdiction: jurisdiction,
          requirement_template: requirement_template,
        ) do |jtr_step|
          jtr_step.energy_step_required =
            (
              if jurisdiction.respond_to?(:energy_step_required)
                jurisdiction.energy_step_required || 0
              else
                ENV["MIN_ENERGY_STEP"].to_i
              end
            )
          jtr_step.zero_carbon_step_required =
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

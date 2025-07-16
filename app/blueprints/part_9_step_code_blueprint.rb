class Part9StepCodeBlueprint < StepCodeBaseBlueprint
  association :checklists, blueprint: StepCode::Part9::ChecklistBlueprint

  field :energy_steps do |_step_code, _options|
    (
      ENV["PART_9_MIN_ENERGY_STEP"].to_i..ENV["PART_9_MAX_ENERGY_STEP"].to_i
    ).to_a.map(&:to_s)
  end

  field :zero_carbon_steps do |_step_code, _options|
    (
      ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i..ENV[
        "PART_9_MAX_ZERO_CARBON_STEP"
      ].to_i
    ).to_a.map(&:to_s)
  end
end

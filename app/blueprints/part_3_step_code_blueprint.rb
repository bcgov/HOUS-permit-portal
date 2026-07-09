class Part3StepCodeBlueprint < StepCodeBaseBlueprint
  association :checklist,
              blueprint:
                StepCode::Part3::ChecklistBlueprint do |step_code, _options|
    step_code.current_checklist
  end
  association :checklists,
              blueprint:
                StepCode::Part3::ChecklistSummaryBlueprint do |step_code, _options|
    step_code.checklists
  end

  field :is_fully_loaded do |_step_code, _options|
    true
  end

  field :energy_steps do |_step_code, _options|
    (
      ENV["PART_3_MIN_ENERGY_STEP"].to_i..ENV["PART_3_MAX_ENERGY_STEP"].to_i
    ).to_a.map(&:to_s)
  end

  field :zero_carbon_steps do |_step_code, _options|
    (
      ENV["PART_3_MIN_ZERO_CARBON_STEP"].to_i..ENV[
        "PART_3_MAX_ZERO_CARBON_STEP"
      ].to_i
    ).to_a.map(&:to_s)
  end
end

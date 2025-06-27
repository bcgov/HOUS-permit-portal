class Part3StepCodeBlueprint < Blueprinter::Base
  identifier :id

  fields :type

  association :checklist, blueprint: StepCode::Part3::ChecklistBlueprint

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

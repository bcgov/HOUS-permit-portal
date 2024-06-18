class StepCode::Energy::ComplianceBlueprint < Blueprinter::Base
  transform StepCode::Energy::MEUITransformer
  transform StepCode::Energy::TEDITransformer
  transform StepCode::Energy::AirtightnessTransformer
  transform RoundDecimalsTransformer

  field :step, name: :proposed_step
  field :min_required_step, name: :required_step
  field :min_required_step, name: :min_step
  field :max_step

  field :fwdr do |compliance, _options|
    compliance.checklist.data_entries.sum(:fwdr)
  end

  field :location do |compliance, _options|
    compliance.checklist.data_entries.pluck(:weather_location).join(", ")
  end

  field :heating_degree_days do |compliance, _options|
    compliance.checklist.data_entries.sum(:hdd)
  end

  field :software_name do |compliance, _options|
    compliance.checklist.data_entries.pluck(:model).uniq.join(", ")
  end

  field :software_version do |compliance, _options|
    compliance.checklist.data_entries.pluck(:version).uniq.join(", ")
  end
end

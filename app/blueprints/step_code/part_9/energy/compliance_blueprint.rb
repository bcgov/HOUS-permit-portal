class StepCode::Part9::Energy::ComplianceBlueprint < Blueprinter::Base
  transform StepCode::Part9::Energy::MEUITransformer
  transform StepCode::Part9::Energy::TEDITransformer
  transform StepCode::Part9::Energy::AirtightnessTransformer
  transform RoundDecimalsTransformer

  field :step, name: :proposed_step
  field :min_required_step, name: :required_step
  field :min_required_step, name: :min_step
  field :max_step

  # Ratio — Excel-style average across suite/model rows (not summed).
  field :fwdr do |compliance, _options|
    compliance.checklist.data_entries.average(:fwdr)
  end

  field :location do |compliance, _options|
    compliance.checklist.data_entries.pluck(:weather_location).join(", ")
  end

  # Climate — one site; never sum HDD across H2K rows.
  field :heating_degree_days do |compliance, _options|
    compliance.checklist.data_entries.maximum(:hdd)
  end

  field :software_name do |compliance, _options|
    compliance.checklist.data_entries.pluck(:model).uniq.join(", ")
  end

  field :software_version do |compliance, _options|
    compliance.checklist.data_entries.pluck(:version).uniq.join(", ")
  end
end

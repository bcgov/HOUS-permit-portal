class StepCode::ComplianceReportBlueprint < Blueprinter::Base
  identifier :requirement_id
  field :energy do |report, _options|
    StepCode::Energy::ComplianceBlueprint.render_as_hash(report[:energy])
  end

  field :zero_carbon do |report, _options|
    StepCode::ZeroCarbon::ComplianceBlueprint.render_as_hash(
      report[:zero_carbon]
    )
  end
end

module StepCodeSpecHelpers
  def stub_part3_compliance_report(checklist:, report_hash: {})
    report_instance =
      instance_double(StepCode::Part3::V1::GenerateReport, results: report_hash)
    allow(StepCode::Part3::V1::GenerateReport).to receive(:new).with(
      checklist: checklist
    ).and_return(report_instance)
    allow(report_instance).to receive(:call).and_return(report_instance)
    allow(StepCode::Part3::ComplianceReportBlueprint).to receive(
      :render_as_hash
    ).with(report_hash).and_return(report_hash)
    report_instance
  end

  def stub_part9_compliance_reports(checklist:, reports:)
    generator = instance_double(StepCode::Compliance::GenerateReports)
    allow(StepCode::Compliance::GenerateReports).to receive(:new).with(
      checklist: checklist,
      requirements: checklist.step_code.step_requirements
    ).and_return(generator)
    allow(generator).to receive(:call).and_return(generator)
    allow(generator).to receive(:reports).and_return(reports)
    generator
  end
end

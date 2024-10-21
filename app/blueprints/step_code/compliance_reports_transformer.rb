class StepCode::ComplianceReportsTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      {
        compliance_reports:
          object.compliance_reports.map do |report|
            StepCode::ComplianceReportBlueprint.render_as_hash(report)
          end
      }
    )
  end
end

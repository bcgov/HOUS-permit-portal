require "rails_helper"

RSpec.describe Infrastructure::TemplateExportService do
  let(:zio) do
    instance_double("Zip::OutputStream", put_next_entry: true, write: true)
  end

  before do
    allow(FileUtils).to receive(:mkdir_p)
    allow(File).to receive(:directory?).and_return(true)
    allow(Rails.logger).to receive(:info)
    allow(Rails.logger).to receive(:warn)
  end

  it "writes manifest and model ndjson into zip" do
    record =
      instance_double("Record", attributes: { "id" => "1", "name" => "x" })
    model = class_double("PermitClassification", find_each: nil)
    allow(model).to receive(:find_each).and_yield(record)

    stub_const(
      "Infrastructure::TemplateExportService::MODELS_TO_EXPORT",
      [{ model: model, filename: "m.ndjson" }]
    )

    allow(Zip::OutputStream).to receive(:open).and_yield(zio)

    described_class.new("/tmp/out.zip").call

    expect(zio).to have_received(:put_next_entry).with("manifest.json")
    expect(zio).to have_received(:put_next_entry).with("m.ndjson")
    expect(zio).to have_received(:write).with(/"exported_at":/)
    expect(zio).to have_received(:write).with("{\"id\":\"1\",\"name\":\"x\"}")
  end

  it "warns and skips a model when NameError occurs" do
    allow(Zip::OutputStream).to receive(:open).and_yield(zio)

    record_model = class_double("SomeMissingModel")
    allow(record_model).to receive(:find_each).and_raise(NameError.new("nope"))

    service = described_class.new("/tmp/out.zip")
    service.send(:write_model, zio, record_model, "missing.ndjson")

    expect(Rails.logger).to have_received(:warn).with(
      /Skipping missing\.ndjson/
    )
  end
end

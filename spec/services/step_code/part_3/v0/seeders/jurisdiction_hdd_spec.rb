RSpec.describe StepCode::Part3::V0::Seeders::JurisdictionHDD do
  describe ".seed!" do
    let(:file_name) do
      "#{Rails.root}/db/templates/jurisdiction_hdd_references.xlsx"
    end
    let(:xlsx) { double("xlsx") }
    let(:jurisdiction) { instance_double(Jurisdiction) }

    it "updates matched jurisdictions with HDD values" do
      allow(File).to receive(:exist?).and_call_original
      allow(File).to receive(:exist?).with(file_name).and_return(true)
      allow(Roo::Spreadsheet).to receive(:open).with(file_name).and_return(xlsx)

      allow(xlsx).to receive(:row).with(1).and_return(
        ["jurisdiction_name", "locality_type", "BCBC 2018 HDD"]
      )
      allow(xlsx).to receive(:last_row).and_return(2)
      allow(xlsx).to receive(:row).with(2).and_return(["City A", "city", 4180])

      allow(Jurisdiction).to receive(:find_by).with(
        name: "City A",
        locality_type: "city"
      ).and_return(jurisdiction)
      allow(jurisdiction).to receive(:update!)

      described_class.seed!

      expect(jurisdiction).to have_received(:update!).with(
        heating_degree_days: 4180
      )
    end

    it "does nothing when the file is missing" do
      allow(File).to receive(:exist?).and_call_original
      allow(File).to receive(:exist?).with(file_name).and_return(false)

      expect(Roo::Spreadsheet).not_to receive(:open)
      expect { described_class.seed! }.not_to raise_error
    end
  end
end

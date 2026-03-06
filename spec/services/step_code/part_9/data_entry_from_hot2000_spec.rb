RSpec.describe StepCode::Part9::DataEntryFromHot2000 do
  describe "#call" do
    let(:xml) { Nokogiri.XML("<HouseFile />") }
    let(:data_entry) { instance_double("Part9::DataEntry") }
    let(:mapper) do
      instance_double(
        StepCode::Part9::DataEntryHot2000Mapper,
        mappings: {
          model: "HOT2000"
        }
      )
    end

    it "updates data entry with mapped attributes" do
      allow(StepCode::Part9::DataEntryHot2000Mapper).to receive(:new).with(
        xml: xml
      ).and_return(mapper)
      allow(data_entry).to receive(:update!)

      described_class.new(xml: xml, data_entry: data_entry).call

      expect(data_entry).to have_received(:update!).with(model: "HOT2000")
    end
  end
end

RSpec.describe StepCode::BuildingCharacteristics::Line::Base do
  let(:klass) do
    Class.new(described_class) do
      attr_accessor :foo
      def fields
        %i[foo]
      end
    end
  end

  describe ".load/.dump and #attributes" do
    it "loads arrays of hashes into objects and dumps them back to hashes" do
      loaded = klass.load([{ foo: 1 }, { foo: 2 }])
      expect(loaded.map(&:attributes)).to eq([{ foo: 1 }, { foo: 2 }])
      expect(klass.dump(loaded.map(&:attributes))).to eq(
        [{ foo: 1 }, { foo: 2 }]
      )
    end
  end
end

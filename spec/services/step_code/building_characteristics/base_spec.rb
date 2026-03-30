RSpec.describe StepCode::BuildingCharacteristics::Base do
  let(:klass) do
    Class.new(described_class) do
      attr_accessor :foo, :bar
      def fields
        %i[foo bar]
      end
    end
  end

  describe ".load/.dump and #attributes" do
    it "loads filtered attributes and dumps attributes hash" do
      obj = klass.load(foo: 1, bar: 2, ignored: 3)
      expect(obj.attributes).to eq({ foo: 1, bar: 2 })
      expect(klass.dump(obj.attributes)).to eq({ foo: 1, bar: 2 })
    end
  end
end

RSpec.describe StepCode::BuildingCharacteristics::Validator do
  let(:invalid_child_class) do
    Class.new do
      include ActiveModel::Model
      attr_accessor :foo
      validates :foo, presence: true
    end
  end

  let(:record_class) do
    Class.new do
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :child, :children
      validates_with StepCode::BuildingCharacteristics::Validator

      def attributes
        { child: child, children: children }
      end
    end
  end

  it "propagates nested validation errors from object attributes" do
    record = record_class.new(child: invalid_child_class.new(foo: nil))
    expect(record).not_to be_valid
    expect(record.errors).not_to be_empty
  end

  it "propagates nested validation errors from arrays" do
    record = record_class.new(children: [invalid_child_class.new(foo: nil)])
    expect(record).not_to be_valid
    expect(record.errors).not_to be_empty
  end
end

# spec/seeds/jurisdiction_seeder_spec.rb
require "rails_helper"

RSpec.describe JurisdictionSeeder do
  context "with valid CSV data" do
    it "creates jurisdictions correctly" do
      # expect { JurisdictionSeeder.seed }.to change { Jurisdiction.count }.by(188)
      # Add more assertions to check if the data is correctly populated
    end
  end
end

# spec/models/jurisdiction_spec.rb
RSpec.describe Jurisdiction, type: :model do
  describe "validations" do
    # it { should validate_uniqueness_of(:name).scoped_to(:locality_type) }
    # it { should validate_presence_of(:locality_type) }
    # Other validation tests
  end

  describe "associations" do
    it { should have_many(:permit_applications) }
    # Other association tests
  end

  describe "#qualified_name" do
    it "returns the qualified name of the jurisdiction" do
      jurisdiction =
        build(:sub_district, name: "Example", locality_type: "city")
      expect(jurisdiction.qualified_name).to eq("City of Example")
    end
  end
end

require "rails_helper"

RSpec.describe ExternalApiKey, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should belong_to(:jurisdiction) }
  end

  describe "validations" do
    context "name" do
      it "enforces name is required" do
        valid_external_api_key = build(:external_api_key)
        invalid_external_api_key = build(:external_api_key, name: nil)

        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:name]).to include("can't be blank")
        expect(valid_external_api_key.valid?).to eq(true)
      end

      it "enforces name is unique" do
        name = "test_name"
        valid_external_api_key = create(:external_api_key, name: name)
        invalid_external_api_key = build(:external_api_key, name: name)

        expect(valid_external_api_key.valid?).to eq(true)
        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:name]).to include("has already been taken")
      end
    end

    context "api_key" do
      it "enforces api_key is auto set when not provided" do
        api_key = "test_key"
        external_api_key_without_key_provided = create(:external_api_key)
        external_api_key_with_key_provided = create(:external_api_key, api_key: api_key)

        expect(external_api_key_without_key_provided.api_key).to be_present
        expect(external_api_key_with_key_provided.api_key).to be_present
        expect(external_api_key_with_key_provided.api_key).to eq(api_key)
      end

      it "enforces api_key is unique" do
        api_key = "test_key"
        valid_external_api_key = create(:external_api_key, api_key: api_key)
        invalid_external_api_key = build(:external_api_key, api_key: api_key)

        expect(valid_external_api_key.valid?).to eq(true)
        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:api_key]).to include("has already been taken")
      end
    end
  end
end

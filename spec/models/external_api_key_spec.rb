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

    context "token" do
      it "enforces token is auto set when not provided" do
        token = "test_key"
        external_api_key_without_key_provided = create(:external_api_key)
        external_api_key_with_key_provided = create(:external_api_key, token: token)

        expect(external_api_key_without_key_provided.token).to be_present
        expect(external_api_key_with_key_provided.token).to be_present
        expect(external_api_key_with_key_provided.token).to eq(token)
      end

      it "enforces token is unique" do
        token = "test_key"
        valid_external_api_key = create(:external_api_key, token: token)
        invalid_external_api_key = build(:external_api_key, token: token)

        expect(valid_external_api_key.valid?).to eq(true)
        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:token]).to include("has already been taken")
      end
    end
  end
end

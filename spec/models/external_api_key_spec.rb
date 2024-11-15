require "rails_helper"

RSpec.describe ExternalApiKey, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should belong_to(:jurisdiction) }
  end

  it "has an encrypted token property" do
    external_api_key = create(:external_api_key)
    expect(external_api_key.encrypted_attribute?(:token)).to be(true)
  end

  describe "scopes" do
    it "returns non expired and non revoked tokens only for active scope" do
      active_external_api_keys = [
        create(:external_api_key),
        create(:external_api_key),
        create(:external_api_key, expired_at: Time.now + 1.day),
        create(:external_api_key, expired_at: Time.now + 10.minute)
      ]
      revoked_external_api_keys = [
        create(:external_api_key, revoked_at: Time.now + 1.day),
        create(:external_api_key, revoked_at: Time.now - 1.day),
        create(:external_api_key, revoked_at: Time.now)
      ] # any non nil revoked_at value should be considered as immediately revoked

      expired_external_api_keys = [
        create(:external_api_key, revoked_at: Time.now - 1.day),
        create(:external_api_key, revoked_at: Time.now - 10.minute),
        create(:external_api_key, revoked_at: Time.now)
      ]

      expect(ExternalApiKey.active).to match_array(active_external_api_keys)
    end

    it "returns only external api key's enabled by jurisdictions" do
      active_external_api_keys = [
        create(:external_api_key),
        create(:external_api_key),
        create(:external_api_key, expired_at: Time.now + 1.day),
        create(:external_api_key, expired_at: Time.now + 10.minute)
      ]
      revoked_external_api_keys = [
        create(:external_api_key, revoked_at: Time.now + 1.day),
        create(:external_api_key, revoked_at: Time.now - 1.day),
        create(:external_api_key, revoked_at: Time.now)
      ] # any non nil revoked_at value should be considered as immediately revoked

      expired_external_api_keys = [
        create(:external_api_key, revoked_at: Time.now - 1.day),
        create(:external_api_key, revoked_at: Time.now - 10.minute),
        create(:external_api_key, revoked_at: Time.now)
      ]
      jurisdiction_disabled_external_api_keys = [
        create(:external_api_key, jurisdiction: create(:sub_district)),
        create(
          :external_api_key,
          jurisdiction: create(:sub_district),
          revoked_at: Time.now - 1.day
        ),
        create(
          :external_api_key,
          jurisdiction: create(:sub_district),
          expired_at: Time.now - 1.day
        ),
        create(:external_api_key, jurisdiction: create(:sub_district))
      ]

      expect(ExternalApiKey.active).to match_array(active_external_api_keys)
    end
  end

  describe "validations" do
    context "name" do
      it "enforces name is required" do
        valid_external_api_key = build(:external_api_key)
        invalid_external_api_key = build(:external_api_key, name: nil)

        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:name]).to include(
          "can't be blank"
        )
        expect(valid_external_api_key.valid?).to eq(true)
      end

      it "enforces name is unique per jurisdiction" do
        name = "test_name"
        jurisdiction = create(:sub_district)
        valid_external_api_key =
          create(:external_api_key, name: name, jurisdiction: jurisdiction)
        invalid_external_api_key =
          build(:external_api_key, name: name, jurisdiction: jurisdiction)
        valid_external_api_key_2 = build(:external_api_key, name: name)

        expect(valid_external_api_key.valid?).to eq(true)
        expect(valid_external_api_key_2.valid?).to eq(true)
        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:name]).to include(
          "has already been taken"
        )
      end
    end

    context "expired_at" do
      it "enforces expired_at is required" do
        valid_external_api_key = build(:external_api_key) # factory defaults to Time.now + 1.day
        invalid_external_api_key = build(:external_api_key, expired_at: nil)

        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:expired_at]).to include(
          "can't be blank"
        )
        expect(valid_external_api_key.valid?).to eq(true)
      end
    end

    context "connecting_application" do
      it "enforces connecting_application is required" do
        valid_external_api_key = build(:external_api_key) # factory defaults connecting_application using Faker
        invalid_external_api_key =
          build(:external_api_key, connecting_application: nil)

        expect(invalid_external_api_key.valid?).to eq(false)
        expect(
          invalid_external_api_key.errors[:connecting_application]
        ).to include("can't be blank")
        expect(valid_external_api_key.valid?).to eq(true)
      end
    end

    context "webhook_url" do
      it "enforces webhook_url is a valid url when set to a non blank value" do
        valid_external_api_key =
          build(:external_api_key, webhook_url: "https://www.example.com") # with valid url
        valid_external_api_key_2 = build(:external_api_key, webhook_url: "") # with blank url
        valid_external_api_key_3 = build(:external_api_key, webhook_url: nil) # with nil url
        invalid_external_api_key =
          build(:external_api_key, webhook_url: "invalid") # with invalid url

        expect(invalid_external_api_key.valid?).to eq(false)
        expect(invalid_external_api_key.errors[:webhook_url]).to include(
          "must be a valid URL"
        )
        expect(valid_external_api_key.valid?).to eq(true)
        expect(valid_external_api_key_2.valid?).to eq(true)
        expect(valid_external_api_key_3.valid?).to eq(true)
      end
    end

    context "token" do
      it "enforces token is auto set on create" do
        external_api_key_without_key_provided = create(:external_api_key)

        expect(external_api_key_without_key_provided.token).to be_present
      end

      it "enforces token starts with a fixed name space" do
        token = "test_key"
        external_api_key = create(:external_api_key, token: token)

        expect(external_api_key.valid?).to eq(true)
        expect(external_api_key.token).to start_with(
          external_api_key.token_namespace
        )
      end
    end
  end

  describe "methods" do
    context "expired?" do
      it "returns true if expired_at is in the past" do
        external_api_key =
          create(:external_api_key, expired_at: Time.now - 1.day)

        expect(external_api_key.expired?).to eq(true)
      end

      it "returns true if expired_at is the current time" do
        external_api_key = create(:external_api_key, expired_at: Time.now)

        expect(external_api_key.expired?).to eq(true)
      end

      it "returns false if expired_at is in the future" do
        external_api_key =
          create(:external_api_key, expired_at: Time.now + 1.day)

        expect(external_api_key.expired?).to eq(false)
      end
    end

    context "revoked?" do
      it "returns true if revoked_at is any non nil value" do
        external_api_key_1 =
          create(:external_api_key, revoked_at: Time.now - 1.day)
        external_api_key_2 =
          create(:external_api_key, revoked_at: Time.now + 1.day) # should still be considered
        # revoked is timestamp is in the future. The timestamp is just for logging purposes

        expect(external_api_key_1.revoked?).to eq(true)
        expect(external_api_key_2.revoked?).to eq(true)
      end

      it "returns false if revoked_at is nil" do
        external_api_key = create(:external_api_key, revoked_at: nil)

        expect(external_api_key.revoked?).to eq(false)
      end
    end
  end
end

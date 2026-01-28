require "rails_helper"

RSpec.describe AllowlistedJwt, type: :model do
  describe "database constraints" do
    it "requires jti" do
      user = create(:user)
      record = described_class.new(user_id: user.id, exp: 1.day.from_now)

      expect { record.save!(validate: false) }.to raise_error(
        ActiveRecord::NotNullViolation
      )
    end

    it "requires exp" do
      user = create(:user)
      record = described_class.new(user_id: user.id, jti: SecureRandom.uuid)

      expect { record.save!(validate: false) }.to raise_error(
        ActiveRecord::NotNullViolation
      )
    end

    it "requires user_id" do
      record = described_class.new(jti: SecureRandom.uuid, exp: 1.day.from_now)

      expect { record.save!(validate: false) }.to raise_error(
        ActiveRecord::NotNullViolation
      )
    end

    it "enforces unique jti" do
      user = create(:user)
      jti = SecureRandom.uuid

      described_class.create!(user_id: user.id, jti: jti, exp: 1.day.from_now)
      duplicate =
        described_class.new(user_id: user.id, jti: jti, exp: 2.days.from_now)

      expect { duplicate.save!(validate: false) }.to raise_error(
        ActiveRecord::RecordNotUnique
      )
    end
  end
end

require "rails_helper"

RSpec.describe RevisionReason, type: :model do
  describe "associations" do
    it { should belong_to(:site_configuration) }
    it do
      should have_many(:revision_requests).with_foreign_key(
               :reason_code
             ).with_primary_key(:reason_code)
    end
  end

  describe "validations" do
    it { should validate_presence_of(:description) }
    it { should validate_presence_of(:reason_code) }

    it "enforces unique reason_code" do
      config = SiteConfiguration.create!
      described_class.create!(
        site_configuration: config,
        reason_code: "dup_code",
        description: "A"
      )

      dup =
        described_class.new(
          site_configuration: config,
          reason_code: "dup_code",
          description: "B"
        )

      expect(dup).not_to be_valid
      expect(dup.errors[:reason_code]).to include("has already been taken")
    end
  end

  describe "callbacks" do
    it "normalizes reason_code before validation" do
      config = SiteConfiguration.create!
      reason =
        described_class.create!(
          site_configuration: config,
          reason_code: "Hello World",
          description: "Desc"
        )

      expect(reason.reason_code).to eq("hello_world")
    end

    it "discards when _discard is set" do
      config = SiteConfiguration.create!
      reason =
        described_class.create!(
          site_configuration: config,
          reason_code: "to_discard",
          description: "Desc"
        )

      reason.update!(_discard: true)
      reason.reload

      expect(reason.discarded_at).to be_present
      expect(reason._discard).to eq(false)
    end
  end
end

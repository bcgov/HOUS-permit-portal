require "rails_helper"

RSpec.describe SiteConfiguration, type: :model do
  describe ".instance" do
    it "returns the existing record when present" do
      existing = SiteConfiguration.create!
      expect(SiteConfiguration.instance).to eq(existing)
    end

    it "creates a record when none exists" do
      SiteConfiguration.delete_all
      expect { SiteConfiguration.instance }.to change(
        described_class,
        :count
      ).by(1)
    end
  end

  describe "singleton enforcement" do
    it "prevents creating a second record" do
      SiteConfiguration.create!
      second = SiteConfiguration.new

      expect(second.save).to eq(false)
      expect(second.errors[:base]).to be_present
    end
  end

  describe "help_link_items validation" do
    it "is invalid when a link is set to show but is missing fields" do
      config =
        described_class.new(
          help_link_items: {
            "get_started_link_item" => {
              "show" => true,
              "href" => "https://example.com",
              "title" => nil,
              "description" => "Desc"
            }
          }
        )

      expect(config).not_to be_valid
      expect(config.errors[:base]).to be_present
    end

    it "is invalid when href is present but not http(s)" do
      config =
        described_class.new(
          help_link_items: {
            "get_started_link_item" => {
              "show" => false,
              "href" => "ftp://example.com",
              "title" => "Title",
              "description" => "Desc"
            }
          }
        )

      expect(config).not_to be_valid
      expect(config.errors[:base]).to be_present
    end

    it "is valid when show is false even if other fields are blank" do
      config =
        described_class.new(
          help_link_items: {
            "get_started_link_item" => {
              "show" => false,
              "href" => nil,
              "title" => nil,
              "description" => nil
            }
          }
        )

      expect(config).to be_valid
    end
  end

  describe "#revision_reasons_attributes=" do
    it "reuses a discarded reason with matching reason_code (undiscards and updates)" do
      config = described_class.create!
      reason =
        RevisionReason.create!(
          site_configuration: config,
          reason_code: "same_code",
          description: "Old"
        )
      reason.update!(discarded_at: 1.day.ago)

      expect(reason.discarded_at).to be_present

      config.update!(
        revision_reasons_attributes: [
          "id" => nil,
          "reason_code" => "same_code",
          "description" => "New"
        ]
      )

      reason.reload
      expect(reason.discarded_at).to be_nil
      expect(reason.description).to eq("New")
      expect(
        config
          .revision_reasons
          .with_discarded
          .where(reason_code: "same_code")
          .count
      ).to eq(1)
    end
  end

  describe "revision_reasons limits" do
    it "adds an error when revision_reasons.count exceeds 200" do
      config = described_class.new

      fake_assoc =
        instance_double(
          "RevisionReasonAssociation",
          count: 201,
          kept: instance_double("KeptScope", count: 0)
        )
      allow(config).to receive(:revision_reasons).and_return(fake_assoc)

      expect(config).not_to be_valid
      expect(config.errors[:revision_reasons]).to be_present
    end

    it "adds an error when revision_reasons.kept.count exceeds 20" do
      config = described_class.new

      fake_assoc =
        instance_double(
          "RevisionReasonAssociation",
          count: 0,
          kept: instance_double("KeptScope", count: 21)
        )
      allow(config).to receive(:revision_reasons).and_return(fake_assoc)

      expect(config).not_to be_valid
      expect(config.errors[:revision_reasons]).to be_present
    end
  end

  describe ".archistar_enabled_for_jurisdiction?" do
    let(:jurisdiction) { create(:sub_district) }

    before { SiteConfiguration.delete_all }

    it "returns false when code_compliance_enabled is globally disabled" do
      described_class.create!(
        code_compliance_enabled: false,
        archistar_enabled_for_all_jurisdictions: true
      )

      expect(
        described_class.archistar_enabled_for_jurisdiction?(jurisdiction)
      ).to eq(false)
    end

    it "returns true when archistar_enabled_for_all_jurisdictions is enabled" do
      described_class.create!(
        code_compliance_enabled: true,
        archistar_enabled_for_all_jurisdictions: true
      )

      expect(
        described_class.archistar_enabled_for_jurisdiction?(jurisdiction)
      ).to eq(true)
    end

    it "checks specific enrollments when global override is off" do
      described_class.create!(
        code_compliance_enabled: true,
        archistar_enabled_for_all_jurisdictions: false
      )

      create(
        :jurisdiction_service_partner_enrollment,
        jurisdiction: jurisdiction,
        service_partner: :archistar,
        enabled: true
      )

      expect(
        described_class.archistar_enabled_for_jurisdiction?(jurisdiction)
      ).to eq(true)
    end
  end
end

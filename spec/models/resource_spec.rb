require "rails_helper"

RSpec.describe Resource, type: :model do
  describe "associations" do
    it { should belong_to(:jurisdiction).inverse_of(:resources) }
    it { should have_one(:resource_document).dependent(:destroy) }
  end

  describe "validations" do
    it { should validate_presence_of(:jurisdiction) }
    it { should validate_presence_of(:category) }
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:resource_type) }

    it "requires link_url when resource_type is link" do
      resource =
        described_class.new(
          jurisdiction: create(:sub_district),
          category: "planning_zoning",
          title: "A",
          resource_type: "link",
          link_url: nil
        )

      expect(resource).not_to be_valid
      expect(resource.errors[:link_url]).to include("can't be blank")
    end

    it "requires a resource_document when resource_type is file" do
      resource =
        described_class.new(
          jurisdiction: create(:sub_district),
          category: "planning_zoning",
          title: "A",
          resource_type: "file"
        )

      expect(resource).not_to be_valid
      expect(resource.errors[:base]).to include(
        "Resource document must exist for file type resources"
      )
    end

    it "is valid when resource_type is file and resource_document is present" do
      resource =
        described_class.new(
          jurisdiction: create(:sub_district),
          category: "planning_zoning",
          title: "A",
          resource_type: "file"
        )
      resource.save!(validate: false) # ensure an id exists for uploader path generation

      file =
        Rack::Test::UploadedFile.new(
          StringIO.new("test pdf content"),
          "application/pdf",
          original_filename: "resource.pdf"
        )

      resource_document = ResourceDocument.new(resource: resource)
      resource_document.file = file
      resource.resource_document = resource_document
      expect(resource).to be_valid
    end
  end

  describe "scopes" do
    it ".by_category filters by category" do
      jurisdiction = create(:sub_district)
      a =
        described_class.create!(
          jurisdiction: jurisdiction,
          category: "planning_zoning",
          title: "A",
          resource_type: "link",
          link_url: "https://example.com/a"
        )
      described_class.create!(
        jurisdiction: jurisdiction,
        category: "gis_mapping",
        title: "B",
        resource_type: "link",
        link_url: "https://example.com/b"
      )

      expect(described_class.by_category("planning_zoning")).to match_array([a])
    end
  end

  describe "dependent destroy" do
    it "destroys the resource_document when resource is destroyed" do
      resource =
        described_class.create!(
          jurisdiction: create(:sub_district),
          category: "planning_zoning",
          title: "A",
          resource_type: "link",
          link_url: "https://example.com"
        )

      file =
        Rack::Test::UploadedFile.new(
          StringIO.new("test pdf content"),
          "application/pdf",
          original_filename: "resource.pdf"
        )
      document = ResourceDocument.create!(resource: resource, file: file)

      expect { resource.destroy! }.to change(ResourceDocument, :count).by(-1)
      expect(ResourceDocument.where(id: document.id)).to be_empty
    end
  end

  describe ".resource_reminder_notification_data" do
    it "returns a notification payload" do
      data =
        described_class.send(
          :resource_reminder_notification_data,
          SecureRandom.uuid,
          [SecureRandom.uuid]
        )

      expect(data).to include("id", "action_type", "action_text", "object_data")
      expect(data["object_data"]).to include("jurisdiction_id", "resource_ids")
    end
  end
end

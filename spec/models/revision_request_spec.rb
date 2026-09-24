require "rails_helper"

RSpec.describe RevisionRequest, type: :model do
  describe "associations" do
    it { should belong_to(:submission_version) }
    it { should belong_to(:user).optional }
    it do
      should belong_to(:revision_reason)
               .with_foreign_key(:reason_code)
               .with_primary_key(:reason_code)
               .optional
    end
  end

  describe "validations" do
    it "requires a review_staff user" do
      submission_version = create(:submission_version)
      user = create(:user, :submitter)

      record =
        described_class.new(
          submission_version: submission_version,
          user: user,
          reason_code: "some_code"
        )

      expect(record).not_to be_valid
      expect(record.errors[:user]).to be_present
    end

    it "is valid with a review_staff user" do
      record = build(:revision_request) # factory uses a reviewer user
      expect(record).to be_valid
    end

    it "caps a field revision comment at 350 characters" do
      record = build(:revision_request, comment: "a" * 351)

      expect(record).not_to be_valid
      expect(record.errors[:comment]).to be_present
    end

    it "requires a title on a document request and allows a long description" do
      record =
        build(
          :supporting_document_revision_request,
          title: nil,
          comment: "a" * 400
        )

      expect(record).not_to be_valid
      expect(record.errors[:title]).to be_present

      record.title = "As-built drawings"
      expect(record).to be_valid
    end

    it "keeps reference files off the permit application's supporting documents" do
      request = create(:supporting_document_revision_request)
      create_list(:revision_reference_document, 2, revision_request: request)
      application = request.submission_version.permit_application

      expect(request.revision_reference_documents.count).to eq(2)
      expect(application.supporting_documents).to be_empty
      expect(
        application.all_submission_version_completed_supporting_documents
      ).to be_empty
    end

    it "gives each fulfillment file its own data key and includes it in the package" do
      request = create(:supporting_document_revision_request)
      application = request.submission_version.permit_application
      create(:revision_reference_document, revision_request: request)
      documents =
        create_list(
          :supporting_document,
          2,
          permit_application: application,
          revision_request: request
        )

      expect(documents.map(&:submission_version_id)).to all(be_nil)
      expect(documents.map(&:data_key)).to all(
        start_with("revision_fulfillment_#{request.id}_")
      )
      expect(documents.map(&:data_key).uniq.size).to eq(2)
      expect(
        application.all_submission_version_completed_supporting_documents.map(
          &:id
        )
      ).to match_array(documents.map(&:id))
    end
  end
end

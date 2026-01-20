require "rails_helper"

RSpec.describe ReportDocument, type: :model do
  describe "associations" do
    subject { build(:report_document) }

    it { should belong_to(:step_code) }
  end

  describe "instance methods" do
    describe "#attached_to" do
      it "returns the step_code" do
        doc = build(:report_document)
        expect(doc.attached_to).to eq(doc.step_code)
      end
    end

    describe "#report_generated_event_notification_data" do
      it "includes expected keys and derives filename and download_url" do
        doc = build(:report_document)
        allow(doc).to receive(:file_url).and_return(
          "https://example.com/download"
        )
        allow(doc).to receive(:file).and_return(
          double(metadata: { "filename" => "report.pdf" })
        )

        data = doc.report_generated_event_notification_data
        expect(data["action_type"]).to eq(
          Constants::NotificationActionTypes::STEP_CODE_REPORT_GENERATED
        )
        expect(data["object_data"]["step_code_id"]).to eq(doc.step_code_id)
        expect(data["object_data"]["report_document_id"]).to eq(doc.id)
        expect(data["object_data"]["filename"]).to eq("report.pdf")
        expect(data["object_data"]["download_url"]).to eq(
          "https://example.com/download"
        )
      end
    end

    describe "#share_with_jurisdiction" do
      it "returns false when step_code has no jurisdiction" do
        doc = build(:report_document)
        allow(doc.step_code).to receive(:jurisdiction).and_return(nil)
        expect(doc.share_with_jurisdiction(sender_user: create(:user))).to be(
          false
        )
      end

      it "uses StepCodeReportSharingService when jurisdiction exists" do
        doc = build(:report_document)
        jurisdiction = create(:sub_district)
        allow(doc.step_code).to receive(:jurisdiction).and_return(jurisdiction)

        service = instance_double(StepCodeReportSharingService)
        allow(StepCodeReportSharingService).to receive(:new).and_return(service)
        allow(service).to receive(:send_to_jurisdiction).and_return(true)

        expect(doc.share_with_jurisdiction(sender_user: create(:user))).to be(
          true
        )
        expect(service).to have_received(:send_to_jurisdiction).with(
          jurisdiction.id
        )
      end
    end
  end
end

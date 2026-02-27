require "rails_helper"

RSpec.describe StepCodeReportSharingService do
  let(:step_code) { instance_double("Part9StepCode", id: "sc-1") }
  let(:report_document) do
    instance_double("StepCodeReportDocument", id: "rd-1", step_code: step_code)
  end
  let(:sender_user) { create(:user) }
  let(:service) do
    described_class.new(
      report_document: report_document,
      sender_user: sender_user
    )
  end

  def ensure_permit_type!(code_sym)
    PermitType.find_by(code: code_sym.to_s) ||
      create(:permit_type, code: code_sym)
  end

  describe ".confirmed_contact_email_for_jurisdiction" do
    it "returns nil when permit type not found" do
      allow(PermitType).to receive(:find_by).and_return(nil)
      expect(
        described_class.confirmed_contact_email_for_jurisdiction(
          "j-1",
          "low_residential"
        )
      ).to be_nil
    end

    it "returns confirmed email when contact exists" do
      jurisdiction = create(:sub_district)
      jurisdiction.permit_type_submission_contacts.destroy_all
      contact =
        create(
          :permit_type_submission_contact,
          jurisdiction: jurisdiction,
          permit_type: ensure_permit_type!(:low_residential),
          email: "x@example.com",
          confirmed_at: Time.current
        )

      expect(
        described_class.confirmed_contact_email_for_jurisdiction(
          jurisdiction.id,
          "low_residential"
        )
      ).to eq(contact.email)
    end
  end

  describe "#send_to_jurisdiction" do
    before do
      # Never let ActionMailer/ActiveJob try to serialize RSpec doubles.
      allow(PermitHubMailer).to receive(
        :send_step_code_report_to_jurisdiction
      ).and_return(instance_double("MailerMessage", deliver_later: true))
    end

    it "adds an error when jurisdiction is not found" do
      allow(Jurisdiction).to receive(:find_by).and_return(nil)

      expect(service.send_to_jurisdiction("missing")).to eq(false)
      expect(service.errors).to include("Jurisdiction not found")
    end

    it "adds an error when no confirmed submission contact exists" do
      jurisdiction = create(:sub_district)
      jurisdiction.permit_type_submission_contacts.delete_all
      allow(Jurisdiction).to receive(:find_by).with(
        id: jurisdiction.id
      ).and_return(jurisdiction)
      allow(step_code).to receive(:class).and_return(
        double(name: "Part9StepCode")
      )
      ensure_permit_type!(:low_residential)

      expect(service.send_to_jurisdiction(jurisdiction.id)).to eq(false)
      expect(service.errors.join).to match(
        /No confirmed submission contact found/
      )
    end

    it "enqueues an email and logs when successful" do
      jurisdiction = create(:sub_district)
      allow(jurisdiction).to receive(:qualified_name).and_return("Jur Name")
      permit_type = ensure_permit_type!(:low_residential)
      create(
        :permit_type_submission_contact,
        jurisdiction: jurisdiction,
        permit_type: permit_type,
        email: "to@example.com",
        confirmed_at: Time.current
      )
      mailer = instance_double("MailerMessage", deliver_later: true)

      allow(Jurisdiction).to receive(:find_by).with(
        id: jurisdiction.id
      ).and_return(jurisdiction)
      allow(step_code).to receive(:class).and_return(
        double(name: "Part9StepCode")
      )

      allow(PermitHubMailer).to receive(
        :send_step_code_report_to_jurisdiction
      ).and_return(mailer)
      allow(Rails.logger).to receive(:info)

      expect(service.send_to_jurisdiction(jurisdiction.id)).to eq(true)
      expect(PermitHubMailer).to have_received(
        :send_step_code_report_to_jurisdiction
      )
      expect(Rails.logger).to have_received(:info).with(
        /Step Code Report Shared/
      )
    end

    it "captures errors when mailer raises" do
      jurisdiction = create(:sub_district)
      permit_type = ensure_permit_type!(:low_residential)
      create(
        :permit_type_submission_contact,
        jurisdiction: jurisdiction,
        permit_type: permit_type,
        email: "to@example.com",
        confirmed_at: Time.current
      )

      allow(Jurisdiction).to receive(:find_by).with(
        id: jurisdiction.id
      ).and_return(jurisdiction)
      allow(step_code).to receive(:class).and_return(
        double(name: "Part9StepCode")
      )

      allow(PermitHubMailer).to receive(
        :send_step_code_report_to_jurisdiction
      ).and_raise(StandardError.new("boom"))
      allow(Rails.logger).to receive(:error)

      expect(service.send_to_jurisdiction(jurisdiction.id)).to eq(false)
      expect(service.errors.join).to include("Failed to send email: boom")
    end
  end
end

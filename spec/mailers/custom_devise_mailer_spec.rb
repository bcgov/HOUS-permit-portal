require "rails_helper"

RSpec.describe CustomDeviseMailer, type: :mailer do
  describe "#confirmation_instructions" do
    it "sets change_type to changed when record email is present" do
      record = instance_double("User", email: "x@example.com")
      mailer = described_class.new

      # Stub the Devise::Mailer implementation that `super` calls.
      allow_any_instance_of(Devise::Mailer).to receive(
        :confirmation_instructions
      ).and_return(:ok)

      mailer.confirmation_instructions(record, "token")

      expect(mailer.instance_variable_get(:@change_type)).to eq("changed")
      expect(mailer.instance_variable_get(:@user)).to eq(record)
    end

    it "sets change_type to created when record email is blank" do
      record = instance_double("User", email: nil)
      mailer = described_class.new

      allow_any_instance_of(Devise::Mailer).to receive(
        :confirmation_instructions
      ).and_return(:ok)

      mailer.confirmation_instructions(record, "token")

      expect(mailer.instance_variable_get(:@change_type)).to eq("created")
    end
  end

  describe "#devise_mail" do
    it "prefixes subject and uses devise templates" do
      record = instance_double("User")
      mailer = described_class.new

      allow(mailer).to receive(:initialize_from_record)
      allow(mailer).to receive(:headers_for).and_return(
        {
          to: "to@example.com",
          from: "from@example.com",
          subject: "Confirm your account",
          template_name: "confirmation_instructions"
        }
      )
      allow(FrontendUrlHelper).to receive(:root_url).and_return(
        "http://example.test/"
      )
      allow(I18n).to receive(:t).with(
        "application_mailer.subject_start"
      ).and_return("Permit Hub")

      built = nil
      allow(mailer).to receive(:mail) { |args|
        built = args
        :ok
      }

      mailer.devise_mail(record, :confirmation_instructions, {})

      expect(built[:to]).to eq("to@example.com")
      expect(built[:subject]).to eq("Permit Hub - Confirm your account")
      expect(built[:template_path]).to eq("devise/mailer")
      expect(built[:template_name]).to eq("confirmation_instructions")
      # NOTE: from is no longer set in the mailer as an, so we don't expect it to be set
    end
  end
end

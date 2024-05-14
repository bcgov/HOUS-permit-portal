require "rails_helper"

RSpec.describe Contact, type: :model do
  let(:invalid_email) { { email: "invalid_email", phone: "+1234567890" } }

  let(:invalid_phone) { { email: "test@example.com", phone: "invalid_phone" } }

  describe "associations" do
    it { should belong_to(:contactable) }
  end

  describe "formats" do
    it "is not valid with an invalid email format" do
      contact = Contact.new(invalid_email)
      expect(contact).not_to be_valid
    end

    it "is not valid with an invalid phone number format" do
      contact = Contact.new(invalid_phone)
      expect(contact).not_to be_valid
    end
  end
end

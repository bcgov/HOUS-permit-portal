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

  describe "extension" do
    it "clears extension when phone is blank" do
      contact = Contact.new(email: "test@example.com", phone: "", extension: "123")
      contact.valid?
      expect(contact.extension).to be_blank
    end

    it "keeps extension when phone is present" do
      contact = Contact.new(
        email: "test@example.com",
        phone: "604-456-7890",
        extension: "123"
      )
      contact.valid?
      expect(contact.extension).to eq("123")
    end
  end
end

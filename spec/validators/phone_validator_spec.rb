require "rails_helper"

RSpec.describe PhoneValidator do
  class PhoneValidatedModel
    include ActiveModel::Model
    include ActiveModel::Validations

    attr_accessor :phone

    validates :phone, phone: true
  end

  it "adds an error when phonelib reports invalid" do
    allow(Phonelib).to receive(:valid?).and_return(false)

    model = PhoneValidatedModel.new(phone: "not-a-phone")
    expect(model).not_to be_valid
    expect(model.errors[:phone]).to include("is not a valid phone number")
  end

  it "does not add an error when phonelib reports valid" do
    allow(Phonelib).to receive(:valid?).and_return(true)

    model = PhoneValidatedModel.new(phone: "6041231234")
    expect(model).to be_valid
  end

  it "supports custom message option" do
    klass =
      Class.new(PhoneValidatedModel) do
        validates :phone, phone: { message: "bad phone" }
      end

    allow(Phonelib).to receive(:valid?).and_return(false)
    model = klass.new(phone: "x")
    expect(model).not_to be_valid
    expect(model.errors[:phone]).to include("bad phone")
  end
end

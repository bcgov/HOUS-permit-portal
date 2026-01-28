require "rails_helper"

RSpec.describe PaymentDetail, type: :model do
  # NOTE: The corresponding table does not exist in this app's schema.rb.
  # Avoid instantiating (which would hit the DB for column info).

  it "is an ActiveRecord model class" do
    expect(described_class < ApplicationRecord).to be(true)
  end
end

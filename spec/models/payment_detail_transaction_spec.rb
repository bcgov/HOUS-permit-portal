require "rails_helper"

RSpec.describe PaymentDetailTransaction, type: :model do
  describe "associations" do
    # Avoid DB access if the table is not present in schema yet.
    it "declares belongs_to :payment_detail" do
      reflection = described_class.reflect_on_association(:payment_detail)
      expect(reflection.macro).to eq(:belongs_to)
    end
  end
end

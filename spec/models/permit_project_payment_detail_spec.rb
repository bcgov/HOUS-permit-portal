require "rails_helper"

RSpec.describe PermitProjectPaymentDetail, type: :model do
  describe "associations" do
    # Avoid DB access if the table is not present in schema yet.
    it "declares belongs_to :permit_project" do
      reflection = described_class.reflect_on_association(:permit_project)
      expect(reflection.macro).to eq(:belongs_to)
    end

    it "declares belongs_to :payment_detail" do
      reflection = described_class.reflect_on_association(:payment_detail)
      expect(reflection.macro).to eq(:belongs_to)
    end
  end
end

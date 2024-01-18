require "rails_helper"

RSpec.describe Jurisdiction, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:permit_applications) }
    it { should have_many(:users).class_name("User") }

    # Testing has_many :through association
    it { should have_many(:submitters).through(:permit_applications).source(:submitter) }
  end
end

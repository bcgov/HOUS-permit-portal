require "rails_helper"

RSpec.describe LocalJurisdiction, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:permit_applications) }
    it { should have_many(:review_managers).conditions(role: User.roles[:review_manager]).class_name("User") }
    it { should have_many(:reviewers).conditions(role: User.roles[:reviewer]).class_name("User") }

    # Testing has_many :through association
    it { should have_many(:submitters).through(:permit_applications).source(:submitter) }
  end
end

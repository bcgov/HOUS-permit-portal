require "rails_helper"

RSpec.describe UserContext do
  it "exposes user and sandbox" do
    user = instance_double("User")
    ctx = described_class.new(user, true)

    expect(ctx.user).to eq(user)
    expect(ctx.sandbox).to eq(true)
  end
end

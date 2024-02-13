require "rails_helper"

RSpec.shared_examples "a step code compliance check" do
  it "sets the proposed step as expected" do
    expect(subject.step).to eq(expected_step)
  end
end

RSpec.shared_examples "a passing step code requirement" do
  it "returns true" do
    expect(subject.requirements_met?).to be true
  end
end

RSpec.shared_examples "a failed step code requirement" do
  it "returns false" do
    expect(subject.requirements_met?).to be false
  end
end

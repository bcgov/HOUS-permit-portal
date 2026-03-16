require "rails_helper"

RSpec.describe ApplicationJob, type: :job do
  it "is an ActiveJob base class" do
    expect(described_class < ActiveJob::Base).to be true
  end
end

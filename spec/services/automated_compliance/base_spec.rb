require "rails_helper"

RSpec.describe AutomatedCompliance::Base, type: :service do
  describe "#call" do
    it "raises until implemented by subclasses" do
      expect { described_class.new.call }.to raise_error(
        RuntimeError,
        "To implement automated compliance logics"
      )
    end
  end
end

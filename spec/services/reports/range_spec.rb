require "rails_helper"

RSpec.describe Reports::Range do
  describe ".parse" do
    it "defaults to 12 months when the preset is missing" do
      expect(described_class.parse(nil).preset).to eq("12_months")
    end

    it "defaults to 12 months when the preset is unknown" do
      expect(described_class.parse("forever").preset).to eq("12_months")
    end
  end

  describe "#time_range" do
    it "covers the last 12 months by default" do
      range = described_class.parse("12_months")

      expect(range.start_date).to be_within(2.seconds).of(
        12.months.ago.beginning_of_day
      )
      expect(range.end_date).to be_within(2.seconds).of(Time.current.end_of_day)
    end

    it "has no start date for all time" do
      expect(described_class.parse("all_time").start_date).to be_nil
    end
  end
end

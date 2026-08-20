# frozen_string_literal: true

require "rails_helper"

RSpec.describe LocalTools do
  describe "env guard" do
    it "allows calls in local environments" do
      allow(Rails.env).to receive(:local?).and_return(true)
      expect { described_class.help }.not_to raise_error
    end

    it "refuses to run outside local environments" do
      allow(Rails.env).to receive(:local?).and_return(false)

      expect { described_class.reindex_all }.to raise_error(
        LocalTools::NotLocalError,
        %r{development/test}
      )
    end
  end

  describe ".searchkick_models" do
    it "re-resolves Searchkick.models through constants so stale reload copies are dropped" do
      allow(Rails.application).to receive(:eager_load!)

      stale =
        Class.new do
          def self.name
            "StepCode"
          end
        end

      original = Searchkick.models.dup
      Searchkick.models << stale

      models = described_class.send(:searchkick_models)

      expect(models).to include(StepCode)
      expect(models).not_to include(stale)
      expect(models.count { |m| m.name == "StepCode" }).to eq(1)
    ensure
      Searchkick.models.replace(original) if original
    end
  end
end

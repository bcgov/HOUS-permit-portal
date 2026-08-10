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
end

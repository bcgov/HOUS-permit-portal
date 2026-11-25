require "rails_helper"

RSpec.describe AuthCookies do
  [nil, ""].each do |prefix|
    it "keeps legacy names with #{prefix.inspect} prefix" do
      with_auth_cookie_prefix(prefix) do
        expect(described_class.access_token_name).to eq("access_token")
        expect(described_class.id_token_name).to eq("id_token")
      end
    end
  end

  %w[dev test].each do |environment|
    it "uses distinct names for #{environment}" do
      with_auth_cookie_prefix("hub_#{environment}_") do
        expect(described_class.access_token_name).to eq(
          "hub_#{environment}_access_token"
        )
        expect(described_class.id_token_name).to eq(
          "hub_#{environment}_id_token"
        )
      end
    end
  end
end

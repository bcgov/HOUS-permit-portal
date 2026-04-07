# frozen_string_literal: true

require "rails_helper"

RSpec.describe Devise::JWT::Cookie::Configuration do
  subject(:configuration) { described_class.new }

  it "defaults name to access_token" do
    expect(configuration.name).to eq("access_token")
  end

  it "defaults secure to true" do
    expect(configuration.secure).to be(true)
  end

  it "defaults domain to nil" do
    expect(configuration.domain).to be_nil
  end

  it "defaults httponly to true" do
    expect(configuration.httponly).to be(true)
  end

  it "defaults same_site to :lax" do
    expect(configuration.same_site).to eq(:lax)
  end

  it "allows mutating all attributes" do
    configuration.name = "custom_token"
    configuration.secure = false
    configuration.domain = ".example.test"
    configuration.httponly = false
    configuration.same_site = :strict

    expect(configuration.name).to eq("custom_token")
    expect(configuration.secure).to be(false)
    expect(configuration.domain).to eq(".example.test")
    expect(configuration.httponly).to be(false)
    expect(configuration.same_site).to eq(:strict)
  end
end
